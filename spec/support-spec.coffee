# describe 'support helpers', ->
#   it 'should test for supported extensions', ->
#     expect(support.isSupported()).toBeFalsy()
#     expect(support.isSupported('x')).toBeFalsy()
#     expect(support.isSupported('x.y')).toBeFalsy()
#     expect(support.isSupported('js')).toBeFalsy()
#     expect(support.isSupported('x.js')).toBeTruthy()
#     expect(support.isSupported('pug')).toBeFalsy()
#     expect(support.isSupported('x.pug')).toBeTruthy()
#     expect(support.isSupported('x.js.pug')).toBeTruthy()
#     expect(support.isSupported('x.js.ract.pug')).toBeTruthy()

#   it 'should return all supported extensions', ->
#     expect(support.getExtensions()).toContain 'pug'
#     expect(support.getExtensions()).toContain 'ract'
#     expect(support.getExtensions()).toContain 'coffee'
#     expect(support.getExtensions()).toContain 'litcoffee'

#   it 'should allow test support by extension-type', ->
#     expect(support.isTemplate('pug')).toBeTruthy()
#     expect(support.isTemplate('ract')).toBeTruthy()
#     expect(support.isScript('coffee')).toBeTruthy()
#     expect(support.isScript(['imba', 'jisp'])).toBeTruthy()
