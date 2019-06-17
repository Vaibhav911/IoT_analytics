import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export class timeFilters extends Component {
  continue = e => {
    e.preventDefault();
    this.props.nextStep();
  };

  back = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { values, handleChange } = this.props;
    return (
      <MuiThemeProvider>
        <React.Fragment>
          <AppBar title="Enter Time Filters" />
          <TextField
            hintText="Enter Start Date"
            floatingLabelText="Start Date"
            onChange={handleChange('startDate')}
            defaultValue={values.startDate}
          />
          <br />
          <TextField
            hintText="Enter Your End Date"
            floatingLabelText="End Date"
            onChange={handleChange('endDate')}
            defaultValue={values.endDate}
          />
          <br />
          <TextField
            hintText="Enter Your Frequency"
            floatingLabelText="Frequency"
            onChange={handleChange('frequency')}
            defaultValue={values.frequency}
          />
          <br />
          <RaisedButton
            label="Continue"
            primary={true}
            style={styles.button}
            onClick={this.continue}
          />
          <RaisedButton
            label="Back"
            primary={false}
            style={styles.button}
            onClick={this.back}
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

export default timeFilters;
