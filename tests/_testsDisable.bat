@echo off
for /r %%F in (*.test.ts) do (
  ren "%%F" "%%~nxF.dis"
)
