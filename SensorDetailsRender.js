import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
//import sensorDetailsRender from './SensorDetailsRender';
import { makeStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Checkboxes  from './Checkbox'
// import Selectlist from './Selectlist'
import Selectlist from './Selectlist'
var axios = require("axios");



var Campus=[];
export class sensorDetailsRender extends Component {

  constructor(props) {
    super(props);
    this.state = {
      personName: []
    };
  }
  continue = e => {
    e.preventDefault();
    this.props.nextStep();
  };

  loader = e => {
    
    var link = "http://localhost:5000/campusData";
  var Campus_names=[]


  console.log(link)


  console.log("hello")
axios.get(link).then(res=>{

console.log("the resss is "+ JSON.stringify(res));
console.log(JSON.stringify(res.data.campusList));
var t_no = res.data.campusList.length;
console.log(t_no);
console.log(res)
for (var i=0;i<t_no;i++)
    {
      Campus_names.push(res.data.campusList[i]);
      console.log(res.data.campusList[i]);
      
    } 

    console.log("the campus name" + Campus_names)

this.setState({Campus: Campus_names})

});




  };

  
  handleChange(event) {
    this.setState({
      personName : event.target.value

    })
  }  



  render() {


    var checks =[];
    for(var i=0;i<5;i++)
    {
        checks.push(
          <div>
            <Checkboxes></Checkboxes>
          </div>
        )
    }
    const { values, handleChange } = this.props;
    console.log("The props are"+ this.state.Campus)

    return (
      <MuiThemeProvider>
        <React.Fragment>

      


          
          <AppBar title="Enter Campus Details" />


          <RaisedButton
            label="Load Data"
            primary={true}
            style={styles.button}
            onClick={this.loader}
          />

          <Selectlist Campus = {this.state.Campus} 
           />
       
          {/* <TextField
            hintText="Enter Your First Name"
            floatingLabelText="First Name"
            onChange={handleChange('firstName')}
            defaultValue={values.firstName}
          />
          <br />
         {/* // <Selectlist></Selectlist>
         // <Selectlist></Selectlist> */}
          {/* <TextField
            hintText="Enter Your Last Name"
            floatingLabelText="Last Name"
            onChange={handleChange('lastName')}
            defaultValue={values.lastName}
          />
          <br />
          <TextField
            hintText="Enter Your Email"
            floatingLabelText="Email"
            onChange={handleChange('email')}
            defaultValue={values.email}
          />
          <br /> */}
          <RaisedButton
            label="Continue"
            primary={true}
            style={styles.button}
            onClick={this.continue}
          />
        </React.Fragment>
      </MuiThemeProvider>
    );
  }
}

const styles = {
  button: {
    margin: 15
  }
};

export default sensorDetailsRender;
