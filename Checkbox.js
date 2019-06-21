import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';

export default class Checkboxes extends React.Component {
  
    constructor(props) {
        super(props);
    
        this.state = {checkedA: true,
              checkedB: true,
              checkedF: true,
        };
      }
    
  
//     const [state, setState] = React.useState({
//     checkedA: true,
//     checkedB: true,
//     checkedF: true,
//   });




handleChanger = name  => event => {
    this.setState({ ...this.state, [name]: event.target.checked  });

  };
//   const handleChange = name => event => {
//     setState({ ...state, [name]: event.target.checked });
//   };
render(){

    

  return (
    <div>
      <Checkbox
        checked={this.state.checkedA}
        onChange={this.handleChanger('checkedA')}
        value="checkedA"
        inputProps={{
          'aria-label': 'primary checkbox',
        }}
      />
      {/* <Checkbox
        checked={this.state.checkedB}
        onChange={this.handleChanger('checkedB')}
        value="checkedB"
        color="primary"
        inputProps={{
          'aria-label': 'uncontrolled-checkbox',
        }}
      />
      <Checkbox
        value="checkedC"
        inputProps={{
          'aria-label': 'uncontrolled-checkbox',
        }}
      />
      <Checkbox
        disabled
        value="checkedD"
        inputProps={{
          'aria-label': 'disabled checkbox',
        }}
      />
      <Checkbox
        disabled
        checked
        value="checkedE"
        inputProps={{
          'aria-label': 'disabled checked checkbox',
        }}
      />
      <Checkbox
        checked={this.state.checkedF}
        onChange={this.handleChanger('checkedF')}
        value="checkedF"
        indeterminate
        inputProps={{
          'aria-label': 'indeterminate checkbox',
        }}
      />
      <Checkbox
        defaultChecked
        color="default"
        value="checkedG"
        inputProps={{
          'aria-label': 'checkbox with default color',
        }}
      /> */}
    </div>
  );
}
}