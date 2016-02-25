describe 'support helpers', ->
  it 'should test for supported extensions', ->
    expect(support.isSupported()).toBeFalsy()
    expect(support.isSupported('x.y')).toBeFalsy()
    expect(support.isSupported(['x', 'js'])).toBeFalsy()
    expect(support.isSupported('x.js')).toBeFalsy()
    expect(support.isSupported('jade')).toBeFalsy()
    expect(support.isSupported('x.jade')).toBeTruthy()
    expect(support.isSupported('x.js.jade')).toBeTruthy()
    expect(support.isSupported('x.js.ract.jade')).toBeTruthy()

  it 'should return all supported extensions', ->
    expect(support.getExtensions()).toContain 'jade'
    expect(support.getExtensions()).toContain 'ract'
    expect(support.getExtensions()).toContain 'coffee'
    expect(support.getExtensions()).toContain 'litcoffee'

  it 'should allow test support by extension-type', ->
    expect(support.isTemplate('jade')).toBeTruthy()
    expect(support.isTemplate('ract')).toBeTruthy()
    expect(support.isScript('coffee')).toBeTruthy()
