const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');

const tempDir = path.join(__dirname, '../temp');

const executeCode = async (code, input, language) => {
  await fs.mkdir(tempDir, { recursive: true });
  
  const filename = `code_${Date.now()}`;
  let sourceFile, execFile;
  
  if (language === 'java') {
    sourceFile = path.join(tempDir, 'Main.java');
  } else {
    sourceFile = path.join(tempDir, `${filename}.cpp`);
    execFile = path.join(tempDir, filename);
  }
  
  await fs.writeFile(sourceFile, code);
  
  return new Promise((resolve) => {
    const compileCmd = language === 'java' 
      ? `javac "${sourceFile}"`
      : `g++-15 -std=c++17 "${sourceFile}" -o "${execFile}"`;
    
    exec(compileCmd, { timeout: 10000 }, async (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        fs.unlink(sourceFile).catch(() => {});
        return resolve({ success: false, error: `Compilation Error: ${compileStderr || compileError.message}` });
      }
      
      // Add execute permission for C++ executables
      if (language !== 'java') {
        try {
          await fs.chmod(execFile, 0o755);
        } catch (chmodError) {
          console.log('chmod warning:', chmodError.message);
        }
      }
      
      const runCmd = language === 'java' 
        ? `java Main`
        : `./${filename}`;
      
      console.log('Executing:', runCmd, 'in directory:', tempDir);
      
      const runChild = exec(runCmd, { timeout: 5000, cwd: tempDir }, (runError, runStdout, runStderr) => {
        fs.unlink(sourceFile).catch(() => {});
        if (language === 'java') {
          fs.unlink(path.join(tempDir, 'Main.class')).catch(() => {});
        } else {
          fs.unlink(execFile).catch(() => {});
        }
        
        if (runError) {
          resolve({ success: false, error: `Runtime Error: ${runStderr || runError.message}` });
        } else {
          resolve({ success: true, output: runStdout, error: runStderr });
        }
      });
      
      if (input) {
        runChild.stdin.write(input);
        runChild.stdin.end();
      }
    });
  });
};

const evaluateSubmission = async (code, testCases, language) => {
  await fs.mkdir(tempDir, { recursive: true });
  
  const filename = `submit_${Date.now()}`;
  let sourceFile, execFile;
  
  if (language === 'java') {
    sourceFile = path.join(tempDir, 'Main.java');
  } else {
    sourceFile = path.join(tempDir, `${filename}.cpp`);
    execFile = path.join(tempDir, filename);
  }
  
  await fs.writeFile(sourceFile, code);
  
  const compileCmd = language === 'java' 
    ? `javac "${sourceFile}"`
    : `g++-15 -std=c++17 "${sourceFile}" -o "${execFile}"`;
  
  const compileResult = await new Promise((resolve) => {
    exec(compileCmd, { timeout: 10000 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
  
  if (compileResult.error) {
    await fs.unlink(sourceFile).catch(() => {});
    return { 
      success: true, 
      status: 'Compilation Error', 
      score: 0,
      error: compileResult.stderr || compileResult.error.message 
    };
  }
  
  // Add execute permission for C++ executables
  if (language !== 'java') {
    try {
      await fs.chmod(execFile, 0o755);
    } catch (chmodError) {
      console.log('chmod warning:', chmodError.message);
    }
  }
  
  let passedTests = 0;
  let totalTests = testCases.length;
  let firstFailure = null;
  
  for (let i = 0; i < totalTests; i++) {
    const testCase = testCases[i];
    const runCmd = language === 'java' 
      ? `java Main`
      : `./${filename}`;
    
    const testResult = await new Promise((resolve) => {
      const child = exec(runCmd, { timeout: 5000, cwd: tempDir }, (error, stdout, stderr) => {
        resolve({ error, stdout: stdout.trim(), stderr });
      });
      
      if (testCase.input) {
        child.stdin.write(testCase.input);
      }
      child.stdin.end();
    });
    
    if (testResult.error) {
      firstFailure = { 
        testCase: i + 1, 
        error: 'Runtime Error', 
        details: testResult.stderr || testResult.error.message 
      };
      break;
    }
    
    const expectedOutput = (testCase.expectedOutput || '').trim();
    
    if (testResult.stdout === expectedOutput) {
      passedTests++;
    } else {
      firstFailure = {
        testCase: i + 1,
        error: 'Wrong Answer',
        expected: expectedOutput,
        actual: testResult.stdout
      };
      break;
    }
  }
  
  await fs.unlink(sourceFile).catch(() => {});
  if (language === 'java') {
    await fs.unlink(path.join(tempDir, 'Main.class')).catch(() => {});
  } else {
    await fs.unlink(execFile).catch(() => {});
  }
  
  const score = Math.round((passedTests / totalTests) * 100);
  const status = passedTests === totalTests ? 'Accepted' : 
                firstFailure?.error === 'Runtime Error' ? 'Runtime Error' : 'Wrong Answer';
  
  return { 
    success: true, 
    status, 
    score, 
    passedTests, 
    totalTests,
    firstFailure 
  };
};

module.exports = { executeCode, evaluateSubmission };