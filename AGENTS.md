# Project Instructions

## Windows Shell Safety Rules

**CRITICAL: Never use `findstr` or `find` commands on Windows.**

These commands are dangerous because malformed quoting or escaping can cause them to search from the root of the C: drive, consuming system resources and producing incorrect results. For example, this command is problematic:

```
findstr /c:"\"isRoot\": true" "E:\path\to\file.json" | find /c /v ""
```

### Alternatives

Instead of `findstr` / `find`, use one of these approaches:

1. **Use the built-in Grep and Glob tools** — prefer these for all file searching and pattern matching.

2. **Use Node.js one-liners** when you need to search file contents or count matches:
   ```
   node -e "const fs=require('fs'); const d=fs.readFileSync('file.json','utf8'); console.log((d.match(/pattern/g)||[]).length)"
   ```

3. **Use PowerShell cmdlets** like `Select-String` which handle escaping reliably:
   ```
   Select-String -Path "file.json" -Pattern 'pattern' | Measure-Object | Select-Object -ExpandProperty Count
   ```

4. **Never pipe Windows `find` or `findstr`** — these have unreliable quoting semantics on Windows and fail silently or dangerously when special characters are involved.
