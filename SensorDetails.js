import React, { Component } from 'react';
import SensorDetailsRender from './SensorDetailsRender';
import TimeFilters from './TimeFilters';
import Confirm from './Confirm';
import Success from './Success';

export class SensorDetails extends Component {
  state = {
    step: 1,
    sensorId: '',
    campus: '',
    building: '',
    floor: '',
    zone: '',
    startDate:'',
    endDate:'',
    frequency:''
    
  };

  // Proceed to next step
  nextStep = () => {
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
  };

  // Go back to prev step
  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1
    });
  };

  // Handle fields change
  handleChange = input => e => {
    this.setState({ [input]: e.target.value });
  };

  render() {
    const { step } = this.state;
    const { sensorId,campus,building,floor,zone, startDate,endDate,frequency } = this.state;
    const values = {sensorId,campus,building,floor,zone, startDate,endDate,frequency };

    switch (step) {
      case 1:
        return (
          <SensorDetailsRender
            nextStep={this.nextStep}
            handleChange={this.handleChange}
            values={values}
          />
        );
      case 2:
        return (
          <TimeFilters
            nextStep={this.nextStep}
            prevStep={this.prevStep}
            handleChange={this.handleChange}
            values={values}
          />
        );
      case 3:
        return (
          <Confirm
            nextStep={this.nextStep}
            prevStep={this.prevStep}
            values={values}
          />
        );
      case 4:
        return <Success />;
    }
  }
}

export default SensorDetails;
