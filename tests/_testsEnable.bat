@echo off
for /r %%F in (*.test.ts.dis) do (
  ren "%%F" "%%~nF"
)
