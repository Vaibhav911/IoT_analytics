import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
var axios = require("axios");
import RaisedButton from 'material-ui/RaisedButton';

var gotdata=false;



const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function DialogSelect(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    open: false,
    age: '',
  });
var Campus=[];

 Campus = props.Campus;
 console.log("Inside dialogselect" + Campus)
  


  const handleChange = name => event => {
    setState({ ...state, [name]: (event.target.value) });

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

setState({Building: Building_names})

});


  };

 
 
 
 
 
 
  function handleClickOpen() {
   





    setState({ ...state, open: true });
    console.log(Campus)
  }

 
 
 
 
 
 
 
  function handleClose() {
    setState({ ...state, open: false });
  }




  var optionlist =[];
  if(Campus)
  {
      if(Campus.length)
      {
      for(var i=0;i<Campus.length;i++)
      {
          optionlist.push(
            <option value={Campus[i]}>{Campus[i]}</option>
              
          )
      }
    }

  }
  return (
    <div>
      <br></br>
      
      
      <RaisedButton label="Click for campus list"
            primary={true}
            onClick={handleClickOpen}></RaisedButton>
      
      
      <Dialog disableBackdropClick disableEscapeKeyDown open={state.open} onClose={handleClose}>
        <DialogTitle>Fill the form</DialogTitle>
        <DialogContent>
          <form className={classes.container}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="age-native-simple">Campus</InputLabel>
              <Select
                native
                value={state.Campus}
                onChange={handleChange('Campus')}
                input={<Input id="Campus-native-simple" />}
              >
                <option value="" />
                {optionlist}
               
              </Select>
            </FormControl>
            
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}