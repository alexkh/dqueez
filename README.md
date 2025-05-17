# dqueez
Deez Queez - an easy-to-use quiz platform for teachers

# how to set up a local version for development:
### (assuming that you have node.js and make* installed)
```
git clone git@github.com:alexkh/dqueez.git
cd dqueez/server
make install
make run
```

# if you don't have make* installed:
```
git clone git@github.com:alexkh/dqueez.git
cd dqueez/server
npm ci
node server.js
```

# after that you can open your browser and enter the path:
```
http://localhost:3232
```

*make is not required but it unifies devops across devstacks
