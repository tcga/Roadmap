module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        coffee:
            source:
                expand: true
                flatten: true
                cwd: 'src'
                src: ['*coffee']
                dest: ''
                ext: '.js'
            tests:
                expand: true
                flatten: true
                cwd: 'test/src'
                src: ['*coffee']
                dest: 'test'
                ext: '.js'
        nodeunit:
            all: ['test/*_test.js']
        watch:
            files: ['src/*coffee', 'test/src/*coffee']
            tasks: ['coffee', 'nodeunit']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-nodeunit'
    grunt.loadNpmTasks 'grunt-contrib-watch'

    grunt.registerTask 'default', ['coffee', 'nodeunit']
