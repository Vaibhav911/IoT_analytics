import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import SensorList from './SensorList'
import ZoneList from './ZoneList'
import FloorList  from './FloorList'
import BuildingList from './BuildingList'
import NewCampusList from './NewCampusList'
import GetData from './GetData';
import CampusList from './CampusList';
import StartTimePicker from './StartTimePicker'
import EndTimePicker from './EndTimePicker'
import SelectFrequency from './SelectFrequency'
import axios from 'axios';
import { Button } from '@material-ui/core';
// import Material from './Material'
import InputLabelTextField from './InputLabelTextField' 
import GroupedBar from './GroupedBar'
import HeatMap from './HeatMap'
import LineChart from './LineChart'
import PieChart from './PieChart'
import ScatterChart from './ScatterChart'
import InputHomePage from './InputHomePage'
import { Route, BrowserRouter } from "react-router-dom";
import HideAppBar from './HideAppBar'
import SwitchLabel from './SwitchLabel'
import StartType from './StatType'
import StatType from './StatType';
import SelectSensorType from './SelectSensorType'
import AddSensor from './AddSensor'
import AddBuilding from './AddBuilding'

//  window.clientQuery = {sensorList_Array: [{sensorList: [], label:''}], startTime: '', endTime: '', frequency: ''};
window.clientQuery = {sensorList_Array: [{sensorList: [], label:'',sensorType:''}], startTime: '', endTime: '', frequency: ''};


function App() {
  
  const [state, setState] = React.useState({
   
  })

  useEffect(() =>
  {

      
      
      
      
  },[])

  


  
  return (
    <div >

<BrowserRouter>
    <div>
    <Route
      exact={true}
      path="/inputhomepage"
      render={() => (
        <div>
          <InputHomePage/>

        </div>
      )}
    />


    <Route
      exact={true}
      path="/graphs"
      render={() => (
        <div>
      
      <HideAppBar></HideAppBar>
      <GroupedBar graphData= {window.graphData}></GroupedBar>
      <LineChart></LineChart>
          <HeatMap/>
          <ScatterChart></ScatterChart>
          

          


        </div>
      )}
    />

  <Route
      exact={true}
      path="/addsensor"
      render={() => (
        <div>
          <AddSensor/>
          {/* <AddBuilding></AddBuilding> */}
         {/* <StatType></StatType>
        <SelectSensorType></SelectSensorType>
          <HeatMap/>
          <LineChart></LineChart> */}
          


        </div>
      )}
  />

<Route
      exact={true}
      path="/"
      render={() => (
        <div>
    Please Check other links
          


        </div>
      )}
  />


    </div>
</BrowserRouter>
        {/* <div>
          <InputHomePage></InputHomePage>
        </div> */}
        {/* <div>
          {state.CampusData}

          
        </div>

        <div>
           <Button variant="contained" color="primary" onClick={handleAddInputBlock}>Add to compare</Button>
        </div>

        <hr></hr>

        <div style={{display: "inline-block"}}>
          <StartTimePicker></StartTimePicker>
        </div>

        <div style={{display: "inline-block"}}>
          <EndTimePicker></EndTimePicker>
        </div>

        <div style={{display: "inline-block"}}>
          <SelectFrequency></SelectFrequency>
        </div>

        
 
         <div>
           <Button variant="contained" color="primary" onClick={handle}></Button>
        </div> */}

        {/* <div>
          <GroupedBar></GroupedBar>
        </div>
        <div>
          <HeatMap></HeatMap>
        </div>
        <div>
          <LineChart></LineChart>
        </div>
      <div>
        <PieChart></PieChart>
      </div>
      <div>
        <ScatterChart></ScatterChart>
      </div> */}
    </div>
  );
}

export default App;


// async function getLabels()
// {
//   var link = "http://localhost:5000/getlabels";
//   await axios.get(link).then(res => {
//     console.log('data receivede '+ JSON.stringify(res.data.locationLabels))
//     suggestions= res.data.locationLabels;

    
//   })
// }
// async function callGetLabels()
// {
//   await getLabels();
// }

// callGetLabels();
// console.log('suggestions are '+ JSON.stringify(suggestions))
