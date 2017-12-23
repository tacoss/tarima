    describe 'CLI', ->
      describe 'asking for --help', ->
        beforeEach (done) ->
          cmd '--help', done

        it 'should display usage info', ->
          expect(cmd.stdout).toContain 'tarima [watch]'

      describe 'asking for --version', ->
        beforeEach (done) ->
          cmd '--version', done

        it 'should display the package version', ->
          expect(cmd.stdout).toContain require('../package.json').version

      describe 'quick check', ->
        it 'should copy unsupported files (default)', (done) ->
          rmdir 'build'; cmd 'a -fy sample.txt', ->
            expect(cmd.exitStatus).toEqual 0
            expect(cmd.stderr).toEqual ''
            expect(cmd.stdout).toMatch /copy.+?sample\.txt/
            expect(cmd.stdout).toContain '1 file written'
            expect(read('build/a/sample.txt')).toContain 'OK'
            done()

        it 'should fail on broken sources when bundling', (done) ->
          rmdir 'build'; cmd 'a -fby bad.js', ->
            expect(cmd.exitStatus).toEqual 1
            expect(cmd.stderr).toContain 'export default `42'
            expect(cmd.stderr).toContain 'Unterminated template'
            expect(cmd.stdout).not.toContain 'Without changes'
            done()

        it 'should bundle without mixed modules', (done) ->
          rmdir 'build'; cmd 'a -fby good.js', ->
            # FIXME: expect(cmd.exitStatus).toEqual 0
            expect(cmd.stderr).toEqual ''
            expect(cmd.stdout).toContain 'build/a/good.js'
            expect(cmd.stdout).toContain '1 file written'
            expect(read('build/a/good.js')).toContain '[x, template]'
            done()
