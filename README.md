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

### or, run using nodemon. It detects changes to files and auto-restarts server:
```
make dev
```


# if you don't have make* installed:
```
git clone git@github.com:alexkh/dqueez.git
cd dqueez/server
npm ci
node server.js
```

### or, if you have nodemon:
```
nodemon server.js
```

# after that you can open your browser and enter the path:
```
http://localhost:3232
```

*make is not required but it unifies devops across devstacks

# Changelog:
Wed 18 Jun 2025:
- added question_ops.js for those functions that are shared between the quiz
editing page and the student's page. The new gen_questions_div() function will
be used to generate the html for the quiz received as json. It will iterate
each question and call gen_question(), which will detect the question type and
call the corresponding function such as gen_question_radio(),
gen_question_check(), gen_question_number(), gen_question_word() for radio
buttons, checkboxes, numeric and single word answers correspondingly. The idea
is to replace the add_question() and such in edit.js. If the question is
editable, the third parameter to gen_question() should be set to true. The
editable question contans inputs and buttons. This is now only implemented in
edit.js, but it should be moved to question_ops.js


