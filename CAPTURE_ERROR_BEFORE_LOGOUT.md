# Capture Error Before Logout

## Problem
Logout hoye gele console clear hoye jay, tai error dekhte parchhen na.

## Solution: Error Capture Script

### Step 1: Open Browser Console (F12)

### Step 2: Paste This Script

```javascript
// Create error logger that survives logout
window.errorLog = [];
window.requestLog = [];

// Capture all console errors
const originalError = console.error;
console.error = function(...args) {
  window.errorLog.push({
    time: new Date().toISOString(),
    type: 'error',
    message: args
  });
  originalError.apply(console, args);
};

// Capture all console logs
const originalLog = console.log;
console.log = function(...args) {
  const msg = args.join(' ');
  if (msg.includes('API') || msg.includes('Error') || msg.includes('error')) {
    window.requestLog.push({
      time: new Date().toISOString(),
      message: args
    });
  }
  originalLog.apply(console, args);
};

// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  window.requestLog.push({
    time: new Date().toISOString(),
    type: 'REQUEST',
    url: url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body
  });
  
  return originalFetch.apply(this, args)
    .then(response => {
      window.requestLog.push({
        time: new Date().toISOString(),
        type: 'RESPONSE',
        url: url,
        status: response.status,
        statusText: response.statusText
      });
      
      // If error status, capture response
      if (response.status >= 400) {
        response.clone().json().then(data => {
          window.requestLog.push({
            time: new Date().toISOString(),
            type: 'ERROR_RESPONSE',
            url: url,
            status: response.status,
            data: data
          });
        }).catch(() => {});
      }
      
      return response;
    })
    .catch(error => {
      window.requestLog.push({
        time: new Date().toISOString(),
        type: 'FETCH_ERROR',
        url: url,
        error: error.message
      });
      throw error;
    });
};

// Save logs to localStorage before logout
window.addEventListener('beforeunload', function() {
  localStorage.setItem('errorLog', JSON.stringify(window.errorLog));
  localStorage.setItem('requestLog', JSON.stringify(window.requestLog));
});

console.log('✅ Error capture enabled! Logs will survive logout.');
console.log('📝 To view logs after logout, run: viewSavedLogs()');

// Function to view saved logs
window.viewSavedLogs = function() {
  const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
  const requestLog = JSON.parse(localStorage.getItem('requestLog') || '[]');
  
  console.log('=== SAVED ERROR LOG ===');
  console.table(errorLog);
  
  console.log('=== SAVED REQUEST LOG ===');
  console.table(requestLog);
  
  return { errorLog, requestLog };
};

// Function to export logs
window.exportLogs = function() {
  const logs = {
    errorLog: window.errorLog,
    requestLog: window.requestLog,
    savedErrorLog: JSON.parse(localStorage.getItem('errorLog') || '[]'),
    savedRequestLog: JSON.parse(localStorage.getItem('requestLog') || '[]')
  };
  
  console.log('=== ALL LOGS ===');
  console.log(JSON.stringify(logs, null, 2));
  
  // Copy to clipboard
  const text = JSON.stringify(logs, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    console.log('✅ Logs copied to clipboard!');
  });
  
  return logs;
};
```

### Step 3: Try Creating Patient

Fill form and click "Create Patient"

### Step 4: After Logout (if it happens)

Open console again and run:

```javascript
viewSavedLogs();
```

This will show all captured errors!

### Step 5: Export Logs

```javascript
exportLogs();
```

This will copy all logs to clipboard. Paste and share with me!

---

## Alternative: Network Tab (Preserve Log)

1. Open DevTools (F12)
2. Go to "Network" tab
3. ✅ Check "Preserve log" checkbox (top of Network tab)
4. Try creating patient
5. Even after logout, network requests will remain!
6. Screenshot and share

---

## Alternative: Use Incognito Window

1. Open Incognito/Private window
2. Login
3. Try creating patient
4. If logout happens, regular window console still has logs
5. Switch back to regular window to see logs

---

## Quick Test Right Now:

1. Paste the error capture script in console
2. Try creating patient
3. If logout happens, immediately run:
   ```javascript
   // Check if logs were saved
   localStorage.getItem('requestLog');
   ```
4. Share the output!
