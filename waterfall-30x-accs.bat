FOR /F %%i in ( params.txt ) do (
    call node waterfall.js %%i
)