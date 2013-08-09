module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        coffee: # Compile Coffeescripts
            source:
                options:
                    sourceMap: true
                expand: true
                flatten: true
                cwd: 'src'
                src: ['*coffee']
                dest: ''
                ext: '.js'
            tests:
                options:
                    sourceMap: true
                expand: true
                flatten: true
                cwd: 'test/src'
                src: ['*coffee']
                dest: 'test'
                ext: '.js'
        nodeunit: # Run unit tests
            all: ['test/*_test.js']
        watch: # Watch files for changes to re-run compile and tests
            files: ['src/*coffee', 'test/src/*coffee']
            tasks: ['coffee', 'nodeunit']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-nodeunit'
    grunt.loadNpmTasks 'grunt-contrib-watch'

    grunt.registerTask 'default', ['coffee', 'nodeunit']
