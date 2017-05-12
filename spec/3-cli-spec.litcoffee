    describe 'CLI', ->
      describe 'asking for --help', ->
        beforeEach (done) ->
          cmd '--help', done

        it 'should display usage info', ->
          expect(cmd.stdout).toContain 'tarima [OPTIONS]'

      describe 'asking for --version', ->
        beforeEach (done) ->
          cmd '--version', done

        it 'should display the package version', ->
          expect(cmd.stdout).toContain require('../package.json').version

      # FIXME
      # describe 'basic support', ->
      #   it 'should copy unsupported files (default)', (done) ->
      #     rmdir 'build'; cmd 'a -fd', ->
      #       expect(cmd.stdout).toMatch /copy.+?sample\.txt/
      #       expect(cmd.stdout).toContain '1 file written'
      #       expect(read('build/a/sample.txt')).toContain 'OK'
      #       done()
