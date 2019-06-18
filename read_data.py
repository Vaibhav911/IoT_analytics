
import sys, json, numpy as np

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    lines = read_in()
    print(lines[4].readingArray)
    print(type(lines))

#start process
if __name__ == '__main__':
    main()


--vaibhav's code--

import sys, json, numpy as np
import datetime
from dateutil import parser
#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    data = read_in()
    freq = data[0]
    start_time = parser.parse(data[1][0:-1])
    end_time = parser.parse(data[2][0:-1])
    annual_data = data[3]
    monthly_data = data[4]
    daily_data = data[5]
    hourly_data = data[6]
    attribute = 'temperature'
    
    if freq == 'annual':
        print('in annual')
        num_of_years = end_time.year - start_time.year + 1
        final_annual_data = [[] for year_num in range(num_of_years)]
        final_annual_labels = [None for year_num in range(num_of_years)]
        for year in annual_data:
            index = (year['year'] -100 + 2000) - start_time.year#change it later
            for month in  year['monthArray']:
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            print('reading obj', reading)
                            final_annual_data[index].append(reading[attribute])
        print('final annual data', final_annual_data)
                            
    
    
    
