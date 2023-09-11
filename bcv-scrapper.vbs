Set oShell = CreateObject ("Wscript.Shell")
Dim strArgs
strArgs = "cmd /c D:\Projects\BCV-scrapping\bcv-scrapping.bat"
oShell.Run strArgs, 0, false