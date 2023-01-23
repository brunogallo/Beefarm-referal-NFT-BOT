FOR /F %%i in ( params.txt ) do (
    call node app888.js %%i
)