const Example = () => (
  <>
    <h1>OK</h1>
    <!--IF FOO-->
    FIXED
    <!--ENDIF-->
  </>
);

//IF_NOT BAR
console.log(42);
//ENDIF

export default Example;
