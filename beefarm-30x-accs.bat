FOR /F %%i in ( params.txt ) do (
    call node beefarm.js %%i
)