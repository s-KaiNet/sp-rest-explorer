### Cron builder
 https://crontab.guru (remove leading zero, as it doesn't accept seconds)

 ### How to trigger time function locally   
 https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#run-functions-locally

HTTP POST:
```
http://localhost:{port}/admin/functions/{function_name}
```

body: 
```
{
    "input": "<trigger_input>"
}
```

### V2 requirements for Azure Portal
In order to run v2 function with blob triggger for example, you should install trigger first with command (d\home\site\wwwroot):   
```
dotnet build extensions.csproj -o bin --no-incremental --packages D:\home\.nuget
```
more info - https://github.com/Azure/azure-functions-host/wiki/Updating-your-function-app-extensions
https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings#register-binding-extensions

### Debugging
V2 requires additional changes in `local.settings.json`: 
```
"NODE_OPTIONS": "--inspect=5858",
```