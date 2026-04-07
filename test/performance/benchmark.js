// Performance benchmark for Console Log Viewer
const fs = require('fs');
const path = require('path');

// Mock the Obsidian environment
global.window = {
  performance: {
    now: () => Date.now(),
    memory: { usedJSHeapSize: 0 }
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};

global.document = {
  createElement: (tag) => {
    return {
      className: '',
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      setAttribute: () => {},
      innerHTML: '',
      textContent: ''
    };
  }
};

// Import the ConsoleHook
const { ConsoleHook } = require('../../dist/main.js');

function generateTestLogs(count) {
  const logs = [];
  const levels = ['info', 'warn', 'error'];
  
  for (let i = 0; i < count; i++) {
    const level = levels[i % levels.length];
    const message = `Test log message ${i} with some random content to make it longer and more realistic for performance testing.`;
    logs.push({ level, message });
  }
  
  return logs;
}

async function runBenchmark(logCount) {
  console.log(`\n=== Benchmark: ${logCount} logs ===`);
  
  // Create console hook
  const consoleHook = new ConsoleHook({
    maxLogs: logCount,
    captureStackTrace: false,
    passThrough: false
  });
  
  // Generate test logs
  const testLogs = generateTestLogs(logCount);
  
  // Test log capture performance
  const captureStart = Date.now();
  testLogs.forEach(({ level, message }) => {
    if (level === 'info') {
      console.info(message);
    } else if (level === 'warn') {
      console.warn(message);
    } else {
      console.error(message);
    }
  });
  const captureTime = Date.now() - captureStart;
  
  // Test getLogs performance
  const getLogsStart = Date.now();
  const logs = consoleHook.getLogs();
  const getLogsTime = Date.now() - getLogsStart;
  
  // Test filtering performance (simulating search)
  const filterStart = Date.now();
  const filteredLogs = logs.filter(log => 
    log.message.includes('Test') && log.level !== 'error'
  );
  const filterTime = Date.now() - filterStart;
  
  // Test array operations performance
  const arrayOpsStart = Date.now();
  const reversedLogs = [...filteredLogs].reverse();
  const arrayOpsTime = Date.now() - arrayOpsStart;
  
  console.log(`Capture time: ${captureTime}ms`);
  console.log(`Get logs time: ${getLogsTime}ms`);
  console.log(`Filter time: ${filterTime}ms`);
  console.log(`Array ops time: ${arrayOpsTime}ms`);
  console.log(`Total time: ${captureTime + getLogsTime + filterTime + arrayOpsTime}ms`);
  
  return {
    logCount,
    captureTime,
    getLogsTime,
    filterTime,
    arrayOpsTime,
    totalTime: captureTime + getLogsTime + filterTime + arrayOpsTime
  };
}

async function main() {
  console.log('Console Log Viewer Performance Benchmark');
  console.log('========================================');
  
  const testCounts = [100, 500, 1000, 2000];
  const results = [];
  
  for (const count of testCounts) {
    const result = await runBenchmark(count);
    results.push(result);
  }
  
  console.log('\n=== SUMMARY ===');
  console.table(results);
  
  // Check acceptance criteria
  const hundredResult = results.find(r => r.logCount === 100);
  const thousandResult = results.find(r => r.logCount === 1000);
  
  console.log('\n=== ACCEPTANCE CRITERIA ===');
  if (hundredResult && hundredResult.totalTime < 100) {
    console.log('✅ 100 logs < 100ms: PASSED');
  } else {
    console.log('❌ 100 logs < 100ms: FAILED');
  }
  
  if (thousandResult && thousandResult.totalTime < 500) {
    console.log('✅ 1000 logs < 500ms: PASSED');
  } else {
    console.log('❌ 1000 logs < 500ms: FAILED');
  }
}

// Run the benchmark
main().catch(console.error);