FOR /F %%i in ( params.txt ) do (
    call node app.js %%i
)