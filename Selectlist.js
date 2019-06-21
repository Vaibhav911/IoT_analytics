import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import RaisedButton from 'material-ui/RaisedButton';
var axios = require("axios");


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function Selectlist(props) {
  const classes = useStyles();
  console.log("31"+ props.Campus)
  const [values, setValues] = React.useState({
    Campus:''
  });
  

 console.log("Inside dialogselect" + values.Campus)
  

  // const inputLabel = React.useRef(null);
  // const [labelWidth, setLabelWidth] = React.useState(0);
  // React.useEffect(() => {
  //   setLabelWidth(inputLabel.current.offsetWidth);
  // }, []);

  function handleChange(event) {
    setValues(oldValues => ({
      ...oldValues,
      [event.target.name]: event.target.value,
    }));

    var link = "http://localhost:5000/buildingData?"
    +"campusName="+event.target.value;
  var Building_names=[]


  console.log(link)


  console.log("hello")
axios.get(link).then(res=>{

console.log("the resss is "+ JSON.stringify(res));
console.log(JSON.stringify(res.data.buildingList));
var t_no = res.data.buildingList.length;
console.log(t_no);
console.log(res)
for (var i=0;i<t_no;i++)
    {
      Building_names.push(res.data.buildingList[i]);
      console.log(res.data.buildingList[i]);
      
    } 

    console.log("the building name" + Building_names)

setValues({Building: Building_names})

});}



var Menulist =[];
  if(values.Campus)
  {
      if(values.Campus.length)
      {
      for(var i=0;i<values.Campus.length;i++)
      {
          Menulist.push(
            <MenuItem value={values.Campus[i]}>{values.Campus[i]}</MenuItem>
              
          )
      }
    }

  }







  
console.log("105:"+ JSON.stringify(values))
  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="Campus-simple">Campus</InputLabel>
        <Select
          value={values.Campus}
          onChange={handleChange}
          inputProps={{
            name: 'Campus',
            id: 'Campus-simple',
          }}
        >
          <MenuItem value="">
            <em>None</em>
            {Menulist}

          </MenuItem>
        </Select>
      </FormControl>
      
    </form>
  );
}