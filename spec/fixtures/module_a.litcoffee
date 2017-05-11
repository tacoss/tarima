---
_bundle: a.b.c
datum: !include bar.yml
---

    import x from './component_x'
    import y from './component_y'
    import z from './component_z'
    import b from './module_b'

    Vue.component 'x', x
    Vue.component 'y', y

    export default b
