import sys, json, numpy as np
from dateutil import parser
from datetime import date, datetime
import pandas as pd
#from dateutil import relativedelta
#
##Read data from stdin
def read_in():
    sensordata = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(sensordata[0])

#print('hi from python')
def main():
#    print('in man function');
#    print("hi from python")
#    #get our data as an array from read_in()
    data = read_in()
    
    frequency = data[0]
    attribute_set = data[1]
    sensor_sets = data[2];
    start_time = data[3];
    end_time = data[4]
    annual_data = data[5]
    monthly_data = data[6]
    daily_data = data[7]
    hourly_data = data[8]
    
#    print('atribute setset is', attribute_set)

#    print('sensor sets', sensor_sets)
    sensorIds = [];
    for sensor_set in sensor_sets:
        for sensor in sensor_set:
            sensorIds.append(sensor)
    sensorIds = list(set(sensorIds))
    
#    (annual_data_index, monthly_data_index, daily_data_index, hourly_data_index) = get_sensor_index(sensorIds[0],
#                                                                                                    annual_data,
#                                                                                                    monthly_data,
#                                                                                                    daily_data,
#                                                                                                    hourly_data)
##    
#    (finaldata, finallabels) = organize_sensor_data(attributes[0], frequency, start_time, end_time, annual_data[0],
#                         monthly_data[0], daily_data, hourly_data)
#    
#    finaldata= pd.DataFrame(finaldata)
#    
#    (values, labels) = organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
#                             annual_data, monthly_data, daily_data, hourly_data)
    final_data = []
    sensor_set_index = 0
    
    for attribute_data in attribute_set:
        attributes = attribute_data['attributesArray']
        data_type = attribute_data['dataType']
#        print("data type is", data_type)
#        print('attributes are', attributes)
        
        if data_type == 'quantitative':
#            print('in quantitative')
            final_bar_graph_data = []
            final_histogram_data = []
            sensor_set = sensor_sets[sensor_set_index]
            sensorIds = []
            for sensor in sensor_set:
                sensorIds.append(sensor)
                
#            print('receed line 60')
            (values, labels) = organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
                                 annual_data, monthly_data, daily_data, hourly_data)
#            print('reched line 72')
            data = prepare_bar_graph_quantitative(values)
            final_bar_graph_data.append({'labels': labels, 'values': data})
            
            (labels, counts) = prepare_histogram_quantitative(values)
            final_histogram_data.append({'labels': labels, 'counts': counts })
            
            (attribute_data, sensorIds) = prepare_heat_map_quantitative(values, sensorIds)           
            final_heat_map_data = {'data': attribute_data, 'sensorIds': sensorIds}
            
            sensor_set_index += 1
    
        
#            print(json.dumps({'bar_data': final_bar_graph_data, 'heat_map_data': final_heat_map_data, 'attributes': attributes,
#                          'histogram_data': final_histogram_data}))
            final_data.append({'data_type': 'quantitative', 'bar_data': final_bar_graph_data, 'heat_map_data': final_heat_map_data, 'attributes': attributes,
                          'histogram_data': final_histogram_data})
    
        if data_type == 'qualitative':
#            print('data type is qualitative')
#            print('daily data', daily_data)
#            print('hourly data', hourly_data)
#            print("monthly data", monthly_data)
#            print('annual data', annual_data)
#            print('in 91', sensor_sets[sensor_set_index])
            sensor_set = sensor_sets[sensor_set_index]
            sensorIds = []
            for sensor in sensor_set:
                sensorIds.append(sensor)
                    
#            print('attributes', attributes)
#            print('sensorIds', sensorIds)
            (values, labels) = organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
                                 annual_data, monthly_data, daily_data, hourly_data)
#            print('reached line 102')
            sensor_set_index += 1
#            print('values are', len(values[0][0]))
#            print('labels are', labels)
            bar_graph_attribute_data, qualitative_label_enumeration = prepare_bar_graph_qualitative(values)
            heat_map_attribute_data = prepare_heat_map_qualitative(values, sensorIds, qualitative_label_enumeration)
            histogram_attribute_data = prepare_histogram_qualitative(bar_graph_attribute_data)

#            print(json.dumps({'data_type': 'qualitative' ,'bar_data': bar_graph_attribute_data, 'heat_map_data': heat_map_attribute_data, 'attributes': attributes,
#                              'histogram_data': histogram_attribute_data, 'sensorIds': sensorIds}))
            final_data.append({'data_type': 'qualitative' ,'bar_data': bar_graph_attribute_data, 'heat_map_data': heat_map_attribute_data, 'attributes': attributes,
                              'histogram_data': histogram_attribute_data, 'sensorIds': sensorIds})
#    print('final data', final_data)
    print(json.dumps(final_data))
            
        
        
        
#    print('from heatmap', prepare_heat_map(attributes, frequency, sensor_sets, start_time, end_time, 
#                             annual_data, monthly_data, daily_data, hourly_data))
    
#    print('lne of values', len(values[0]))
#    print('len of labels', (labels))
#    print('reached hre')
#    print('bar graph data', type(prepare_bar_graph(values)))
    
#    print('data to nodejs', {'labels': labels, 'values': prepare_bar_graph(values)  })
    

#    print(json.dumps({'labels': labels, 'values': prepare_bar_graph(values)}))
#    (attribute_data, sensorIds) = prepare_heat_map(attributes, frequency, sensor_sets, start_time, end_time, 
#                             annual_data, monthly_data, daily_data, hourly_data)
#    
#    (histogram_labels_array, histogram_counts_array) = prepare_histogram(attributes, frequency, sensor_sets, start_time, end_time, 
#                             annual_data, monthly_data, daily_data, hourly_data)
#    
#    print(json.dumps({'bar_data': final_bar_graph_data, 'heat_map_data': {'data': attribute_data, 'sensorIds': sensorIds}, 'attributes': attributes,
#                      'histogram_data': {'labels': histogram_labels_array, 'counts': histogram_counts_array}}))
    
        

    
#    print('mean is ', finaldata.std(axis=1))

#    print('finla data', finaldata)
#    print(json.dumps(dict(finaldata.mask(finaldata.isna(), 0))))
#    print(json.dumps({'labels': finallabels, 'values': list(finaldata.mask(finaldata.isna(), 0))}))
    
#    print('final data', finaldata)
#    print('final labels', finallabels)
#    print('data organizing done')    


    
   
def organize_sensor_data(attribute, frequency, start_time, end_time, sensor_annual_data, 
                         sensor_monthly_data, sensor_daily_data, sensor_hourly_data):
     labels = create_labels(frequency, start_time, end_time)

     if frequency =='daily':
        start_time = parser.parse(start_time[0:-1])
        end_time = parser.parse(end_time[0:-1])
        delta = (date(end_time.year, end_time.month,
        end_time.day) - date(start_time.year, start_time.month,
        start_time.day))
        finaldata = []
        finallabels = []
        no_days= delta.days + 1;
        finaldata = [[] for i in range (no_days)]
        finallabels = [None for i in range(no_days)]
        for year in sensor_annual_data:        
            for month in year['monthArray']:
                if start_time.year == (year['year'] + 1900) and start_time.month > int(month['month']):
                    continue
                if end_time.year == (year['year'] + 1900) and end_time.month < int(month['month']):
                    break                
                for day in month['dayArray']:
                    if start_time.year == year['year'] and start_time.month == int(month['month']) and start_time.day > day['date']:
                        continue
                    if end_time.year == year['year'] and end_time.month == month['month'] and end_time.day < day['date']:
                        break
                    for hour in day['hourArray']:
                        s_time= date(start_time.year, start_time.month, 
                                 start_time.day)
                        for reading in hour['readingArray']:
                            read_time = parser.parse(reading['timeStamp'][0:-1])
                            diff = date(read_time.year, read_time.month,
                                    read_time.day)-s_time;
                            index=diff.days;
                            label=(str(read_time)[0:10])
                            if index in range(0, no_days):
                                finaldata[index].append(reading[attribute])
                                finallabels[index]=label

        for month in sensor_monthly_data:
            for day in month['dayArray']:
                if end_time.month == month['month'] and end_time.day < day['date']:
                    break;
                if start_time.month == month['month'] and start_time.day > day['date']:
                    continue
                for hour in day['hourArray']:
                    s_time = date(start_time.year, start_time.month, 
                             start_time.day)
                    for reading in hour['readingArray']:
                        read_time = parser.parse(reading['timeStamp'][0:-1])
                        diff = date(read_time.year, read_time.month,
                                read_time.day)-s_time;
                        index=diff.days;
                        label=(str(read_time)[0:10] )
                        if index in range(0, no_days):
                            finaldata[index].append(reading[attribute])
                            finallabels[index]=label
       
        for day in sensor_daily_data:
            for hour in day['hourArray']:
    
                s_time = date(start_time.year, start_time.month, 
                         start_time.day)
                for reading in hour['readingArray']:
                    read_time = parser.parse(reading['timeStamp'][0:-1])
                    diff = date(read_time.year, read_time.month,
                                    read_time.day)-s_time;
                    index=diff.days;
                    label=(str(read_time)[0:10])
                    if index in range(0, no_days):
                        finaldata[index].append(reading[attribute])
                        finallabels[index]=label
                        
        for hour in sensor_hourly_data:
            s_time = date(start_time.year, start_time.month, 
                     start_time.day)
            for reading in hour['readingArray']:
                read_time = parser.parse(reading['timeStamp'][0:-1])
                diff = date(read_time.year, read_time.month,
                            read_time.day)-s_time;
                index=diff.days;
                label=(str(read_time)[0:10])
                if index in range(0, no_days):
                    finaldata[index].append(reading[attribute])
                    finallabels[index]=label

        return (finaldata,labels)
    
    
     if frequency=='hourly':
        start_time = parser.parse(start_time[0:-1])
        end_time = parser.parse(end_time[0:-1])
        delta = (datetime(end_time.year, end_time.month,
        end_time.day, end_time.hour) - datetime(start_time.year, start_time.month,
        start_time.day, start_time.hour))
        finaldata = []
        finallabels = []
        no_hours=delta.days*24 + delta.seconds//3600 + 1;
        finaldata = [[] for i in range (no_hours)]
        finallabels = [None for i in range(no_hours)]
        for year in sensor_annual_data:
            for month in year['monthArray']:
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        s_time= datetime(start_time.year, start_time.month, 
                                 start_time.day, start_time.hour)
                        for reading in hour['readingArray']:
                            read_time = parser.parse(reading['timeStamp'][0:-1])
                            diff = datetime(read_time.year, read_time.month,
                                    read_time.day, read_time.hour)-s_time;
                            index=diff.days*24 + diff.seconds//3600;
                            label=(str(read_time)[0:-9] + ","+
                                   str(read_time)[-9:-6]+"th Hour")
                            if index in range(0, no_hours):
                                finaldata[index].append(reading[attribute])
                                finallabels[index]=label
        
        for month in sensor_monthly_data:
            for day in month['dayArray']:
                for hour in day['hourArray']:
                    s_time = datetime(start_time.year, start_time.month, 
                             start_time.day, start_time.hour)
                    for reading in hour['readingArray']:
                        read_time = parser.parse(reading['timeStamp'][0:-1])
                        diff = datetime(read_time.year, read_time.month,
                                read_time.day, read_time.hour)-s_time;
                        index=diff.days*24 + diff.seconds//3600;
                        label=(str(read_time)[0:-9] + ","+
                               str(read_time)[-9:-6]+"th Hour")
                        if index in range(0, no_hours):
                            finaldata[index].append(reading[attribute])
                            finallabels[index]=label
        
        for day in sensor_daily_data:
            for hour in day['hourArray']:
        
                s_time = datetime(start_time.year, start_time.month, 
                         start_time.day, start_time.hour)
                for reading in hour['readingArray']:
                    read_time = parser.parse(reading['timeStamp'][0:-1])
                    diff = datetime(read_time.year, read_time.month,
                                    read_time.day, read_time.hour)-s_time;
                    index=diff.days*24 + diff.seconds//3600;
                    label=(str(read_time)[0:-9] + ","+
                    str(read_time)[-9:-6]+"th Hour")
                    if index in range(0, no_hours):
                        finaldata[index].append(reading[attribute])
                        finallabels[index]=label
        for hour in sensor_hourly_data:
            s_time = datetime(start_time.year, start_time.month, 
                     start_time.day, start_time.hour)
            for reading in hour['readingArray']:
                read_time = parser.parse(reading['timeStamp'][0:-1])
                diff = datetime(read_time.year, read_time.month,
                            read_time.day, read_time.hour)-s_time;
                index=diff.days*24 + diff.seconds//3600;
                label=(str(read_time)[0:-9] + ","+
                    str(read_time)[-9:-6]+"th Hour")
                if index in range(0, no_hours):
                    finaldata[index].append(reading[attribute])
                    finallabels[index]=label
                    
        return (finaldata, labels)
    
     if frequency == 'annual':
        start_time = parser.parse(start_time[0:-1])
        end_time = parser.parse(end_time[0:-1])
        num_of_years = end_time.year - start_time.year + 1
        final_annual_data = [[] for year_num in range(num_of_years)]
        final_annual_labels = [None for year_num in range(num_of_years)]

        for year in sensor_annual_data:
            index = (year['year'] -100 + 2000) - start_time.year#change it later
            for month in  year['monthArray']:
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = year['year'] - 100 + 2000
                  

        for month in sensor_monthly_data:
            index = (month['year'] - 100 + 2000) - start_time.year
            for day in month['dayArray']:
                for hour in day['hourArray']:
                    for reading in hour['readingArray']:
                        final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = month['year']
        
        
        for day in sensor_daily_data:
            index = (day['year'] - 100 + 2000) - start_time.year
            for hour in day['hourArray']:
                for reading in hour['readingArray']:
                    final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = day['year']


        for hour in sensor_hourly_data:
            index = (hour['year'] - 100 + 2000) - start_time.year
            for reading in hour['readingArray']:
                final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = hour['year']

        return (final_annual_data, labels)
    
     if frequency == 'monthly':
        start_time = pd.Timestamp(start_time[0:-1])
        end_time = pd.Timestamp(end_time[0:-1])
        num_of_months = (end_time.to_period('M') - start_time.to_period('M')).n + 1
        final_monthly_data = [[] for month_num in range(num_of_months)]
        final_monthly_labels = [None for month_num in range(num_of_months)]
        for year in sensor_annual_data:
            for month in year['monthArray']:
                    current_time = pd.Timestamp(year['year'] + 1900, int(month['month']), 1)
                    index = (current_time.to_period('M') - start_time.to_period('M')).n
                    if index in range(num_of_months):
                        for day in month['dayArray']:
                            for hour in day['hourArray']:
                                for reading in hour['readingArray']:
                                    final_monthly_data[index].append(reading[attribute])
                        final_monthly_labels[index] = str(current_time.to_period('M'))
                    


        for month in sensor_monthly_data:
            current_time = pd.Timestamp(month['year'] + 1900, int(month['month']), 1)
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            final_monthly_data[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
                
        for day in sensor_daily_data:
            current_time = pd.Timestamp(day['year']+1900, day['month']+1, day['date'])
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for hour in day['hourArray']:
                    for reading in hour['readingArray']:
                        final_monthly_data[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
        
        for hour in sensor_hourly_data:
            current_time = pd.Timestamp(hour['year'] + 1900, hour['month'], hour['date'])
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for reading in hour['readingArray']:
                    final_monthly_labels[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))

        return (final_monthly_data, labels)
   

def get_sensor_index(sensorId, annual_data, monthly_data, daily_data, hourly_data):
    annual_data_index = -1
    monthly_data_index = -1
    daily_data_index = -1
    hourly_data_index = -1
        
    for  sensor_year_data in range(len(annual_data)):
        if str(annual_data[sensor_year_data][0]['sensorId']) == sensorId:
            annual_data_index = sensor_year_data
            break;
    for sensor_month_data in range(len(monthly_data)):
        if str(monthly_data[sensor_month_data][0]['sensorId']) == sensorId:
            monthly_data_index =sensor_month_data
            break;
    for sensor_date_data in range(len(daily_data)):
        if str(daily_data[sensor_date_data][0]['sensorId']) == sensorId:
            daily_data_index = sensor_date_data
            break;
    for sensor_hour_data in range(len(hourly_data)):
        if str(hourly_data[sensor_hour_data][0]['sensorId']) == sensorId:
            hourly_data_index = sensor_hour_data
            break;
    return (annual_data_index, monthly_data_index, daily_data_index, hourly_data_index)


def organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
                             annual_data, monthly_data, daily_data, hourly_data):
    
    values = []
    labels = []
    labels_set = False
    
#    print('inside organize all sensor data, attributes', attributes, 'sensorIds', sensorIds)
    
    for attribute in attributes:
        attribute_values_list = [];
        for sensorId in sensorIds:
#            print('in line 446')
            (annual_data_index, monthly_data_index, daily_data_index, hourly_data_index) = get_sensor_index(sensorId, 
                                                                                                            annual_data, 
                                                                                                            monthly_data, 
                                                                                                            daily_data, 
                                                                                                            hourly_data)
#            print('reached line 452')
            sensor_annual_data = []
            sensor_monthly_data = []
            sensor_daily_data = []
            sensor_hourly_data = []
            
            if (annual_data_index != -1):
                sensor_annual_data = annual_data[annual_data_index]          
            if (monthly_data_index != -1):
                sensor_monthly_data = monthly_data[monthly_data_index]
            if (daily_data_index != -1):
                sensor_daily_data = daily_data[daily_data_index]
            if (hourly_data_index != -1):
                sensor_hourly_data = hourly_data[hourly_data_index]

            (finaldata, finallabels) = organize_sensor_data(attribute, frequency, 
                                                            start_time, end_time, 
                                                            sensor_annual_data, 
                                                            sensor_monthly_data, 
                                                            sensor_daily_data,
                                                            sensor_hourly_data)
            attribute_values_list.append(finaldata)
            if (labels_set == False):
                labels = finallabels
                labels_set = True
        
        values.append(attribute_values_list)
    
    return (values, labels)
            
            
def prepare_bar_graph_quantitative(values):
#    print('in func preapare_bar_graph')
    attribute_data = [];
    for attribute in values:
        stats = {'mean': [], 'median': [], 'max': [], 'min': [], 'variance': [], 'stddev': []}
        for sensor_data in attribute:
#            print('sensor data len', len(sensor_data))
#            print('sensor data type', type(sensor_data))
            stats['mean'].append(sensor_data)
        stats['mean'] = np.array(stats['mean'])
#        print('dim are', np.stack(stats['mean'], axis=1).shape)
#        data = prepare_data(np.stack(stats['mean'], axis=1));
        data = prepare_data(np.stack(stats['mean'], axis=1));
#        print('data is', pd.DataFrame(data).var(axis=1))   ******very imp
        stats['mean'] = pd.DataFrame(data).mean(axis=1)
        stats['mean'] = stats['mean'].mask(stats['mean'].isna(), 0).round(2).tolist()
        stats['median'] = pd.DataFrame(data).median(axis=1)
        stats['median'] = stats['median'].mask(stats['median'].isna(), 0).round(2).tolist()
        stats['max'] = pd.DataFrame(data).max(axis=1)
        stats['max'] = stats['max'].mask(stats['max'].isna(), 0).round(2).tolist()
        stats['min'] = pd.DataFrame(data).min(axis=1)
        stats['min'] = stats['min'].mask(stats['min'].isna(), 0).round(2).tolist()
        stats['variance'] = pd.DataFrame(data).var(axis=1)
        stats['variance'] = stats['variance'].mask(stats['variance'].isna(), 0).round(2).tolist()
        stats['stddev'] = pd.DataFrame(data).std(axis=1)
        stats['stddev'] = stats['stddev'].mask(stats['stddev'].isna(), 0).round(2).tolist()
#        print('stats is', stats)
#        print('statsi', stats)
        attribute_data.append(stats)
#        print('\n\n\nattribute arrat;,', attribute_data)
#        print('data is', prepare_data(np.stack(stats['mean'], axis=1)))
#        print('mean is', prepare_data(np.stack(stats['mean'], axis=1)).mean())
#    print('\n\n\n\n\n\len nattribute data', (attribute_data))
#    print('attribute data is', attribute_data)
    return attribute_data
#    print('attribute data len', (attribute_data))
#    print('attribute data type [0]', type(attribute_data[0]))
    
def prepare_bar_graph_qualitative(values):
    attribute_data = []
    for attribute in values:
        sensor_data_array = []
        for sensor_data in attribute:
            sensor_data_array.append(sensor_data)
        sensor_data_array = prepare_data(np.stack(sensor_data_array, axis=1));

        time_perdiod_data = []
        for time_period in sensor_data_array:
            time_perdiod_data.append(pd.Series(time_period).value_counts().to_dict())
        
        unique_qualitative_labels = []
        for time_period in time_perdiod_data:
            unique_qualitative_labels += time_period.keys()
        
        unique_qualitative_labels = list(set(unique_qualitative_labels))       
        qualitative_label_values_non_percentage = {}
        for qualitative_label in unique_qualitative_labels:
            values = []
            for time_period in time_perdiod_data:
                if qualitative_label in time_period:
                    values.append(time_period[qualitative_label])
                else:
                    values.append(0)
            qualitative_label_values_non_percentage[qualitative_label] = values
        
        qualitative_label_values_percentage = {}
        qualitative_label_values_sum = pd.DataFrame(qualitative_label_values_non_percentage.values()).sum()
        for qualitative_label in qualitative_label_values_non_percentage.keys():
            values = []
            for time_period_index in range(len(qualitative_label_values_non_percentage[qualitative_label])):
                percentage_value = qualitative_label_values_non_percentage[qualitative_label][time_period_index] / qualitative_label_values_sum[time_period_index]
                percentage_value *= 100
                percentage_value = round(percentage_value, 2)
                values.append(percentage_value)
            qualitative_label_values_percentage[qualitative_label] = values                
        
        qualitative_label_enumeration = list(enumerate(unique_qualitative_labels))
        expected_values = []
        for time_period_index in range(len(time_perdiod_data)):
            expected_value = 0
            for (enumeration_value, label) in qualitative_label_enumeration:
                expected_value += (qualitative_label_values_percentage[label][time_period_index] / 100.0) * enumeration_value
            expected_values.append(round(expected_value, 2))
        
        attribute_data.append({'non_percentage': qualitative_label_values_non_percentage,
                               'percentage': qualitative_label_values_percentage,
                               'expected_values': expected_values,
                               'enumeration': qualitative_label_enumeration})
#    print('attributed data **592', attribute_data)
    return (attribute_data, qualitative_label_enumeration)
            
    
def prepare_heat_map_quantitative(values, sensorIds):
#    sensorIds = [];
#    for sensor_set in sensor_sets:
#        for sensor in sensor_set:
#            sensorIds.append(sensor)
#    sensorIds = list(set(sensorIds))
#    
#    (values, labels) =  organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
#                             annual_data, monthly_data, daily_data, hourly_data)
#    print('in func preapare_bar_graph')
    attribute_data = [];
    for attribute in values:
        stats_array = []
        for sensor_data in attribute:
            stats = {'mean': [], 'median': [], 'max': [], 'min': [], 'variance': [], 'stddev': []}
#            print('sensor data is', pd.DataFrame(sensor_data).mean(axis=1))
            stats['mean'] =  pd.DataFrame(sensor_data).mean(axis=1)
            stats['mean'] = stats['mean'].mask(stats['mean'].isna(), 0).round(2).tolist()
            stats['median'] =  pd.DataFrame(sensor_data).median(axis=1)
            stats['median'] = stats['median'].mask(stats['median'].isna(), 0).round(2).tolist()
            stats['max'] =  pd.DataFrame(sensor_data).max(axis=1)
            stats['max'] = stats['max'].mask(stats['max'].isna(), 0).round(2).tolist()
            stats['min'] =  pd.DataFrame(sensor_data).min(axis=1)
            stats['min'] = stats['min'].mask(stats['min'].isna(), 0).round(2).tolist()
            stats['variance'] =  pd.DataFrame(sensor_data).var(axis=1)
            stats['variance'] = stats['variance'].mask(stats['variance'].isna(), 0).round(2).tolist()
            stats['stddev'] =  pd.DataFrame(sensor_data).std(axis=1)
            stats['stddev'] = stats['stddev'].mask(stats['stddev'].isna(), 0).round(2).tolist()
            stats_array.append(stats)
        attribute_data.append(stats_array)
#    print('attr data in heat map', attribute_data)
    return (attribute_data, sensorIds)
#        print('stass mena is', stats['mean'].mean(axis=1))
#        print('dim are', np.stack(stats['mean'], axis=1).shape)
#        data = prepare_data(np.stack(stats['mean'], axis=1));
#        data = prepare_data(np.stack(stats['mean'], axis=1));
#        print('data is', pd.DataFrame(data).var(axis=1))   ******very imp
#        stats['mean'] = pd.DataFrame(data).mean(axis=1).tolist()
#        stats['median'] = pd.DataFrame(data).median(axis=1).tolist()
#        stats['max'] = pd.DataFrame(data).max(axis=1).tolist()
#        stats['min'] = pd.DataFrame(data).min(axis=1).tolist()
#        stats['variance'] = pd.DataFrame(data).var(axis=1).tolist()
#        stats['stddev'] = pd.DataFrame(data).std(axis=1).tolist()
#        print('stats is', stats)
#        print('statsi', stats)
#        attribute_data.append(stats)
#        print('\n\n\nattribute arrat;,', attribute_data)
#        print('data is', prepare_data(np.stack(stats['mean'], axis=1)))
#        print('mean is', prepare_data(np.stack(stats['mean'], axis=1)).mean())
#    print('\n\n\n\n\n\len nattribute data', (attribute_data))
#    print('attribute data is', attribute_data)
#    return attribute_data
#    print('attribute data len', (attribute_data))
#    print('attribute data type [0]', type(attribute_data[0]))
    
def prepare_heat_map_qualitative(values, sensorIds, qualitative_label_enumeration):
    attribute_data = [];
    for attribute in values:
        expected_values = []
        for sensor_data in attribute:
            sensor_expected_values = []
            for time_period_data in sensor_data:
#                print('time predio 634', time_period)
                
                time_period_data = pd.Series(time_period_data)
                time_period_data = time_period_data.value_counts().to_dict()
#                print('line 639', time_period_data)
                sum_of_qualitative_label_values = sum(time_period_data.values())
                expected_value = 0
                for enumeration_value, label in qualitative_label_enumeration:
#                    print('line 643', enumeration_value, label)
                    expected_value += enumeration_value * (time_period_data[label] / sum_of_qualitative_label_values)
#                print('expected value 644', expected_value)
                sensor_expected_values.append(round(expected_value, 2))
            expected_values.append(sensor_expected_values)
        attribute_data.append(expected_values)
#    print('attribute data 650', attribute_data)
    return attribute_data
        
    
def prepare_histogram_quantitative(values):
#    sensorIds = [];
#    for sensor_set in sensor_sets:
#        for sensor in sensor_set:
#            sensorIds.append(sensor)
#    sensorIds = list(set(sensorIds))
#    
#    (values, labels) =  organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
#                             annual_data, monthly_data, daily_data, hourly_data)
    
    counts_array = []
    labels_array = []
    for attribute in values:
        sensor_data_array = []
        labels = []
        counts = []
        for sensor_data in attribute:
            sensor_data_array.append(np.hstack(sensor_data))
#        print('sensor data array', pd.DataFrame(np.hstack(sensor_data_array)))
        sensor_data_array = pd.Series(np.hstack(sensor_data_array))
        minimum = sensor_data_array.min()
        maximum = sensor_data_array.max()
#        print('min', minimum, 'max', maximum)
        total_divisions = 7
        width = (maximum - minimum)/7
        for division in range(total_divisions):
            lower_limit = minimum + (division * width)
            upper_limit = lower_limit + width
            count = sum(sensor_data_array.between(lower_limit, upper_limit))
            label = str(round(lower_limit, 2)) + ' - ' + str(round(upper_limit, 2))
#            print(label, 'count', count)
            labels.append(label)
            counts.append(count)
        labels_array.append(labels)
        counts_array.append(counts)
#    print('labels_arrya', labels_array)
#    print('count_array', counts_array)
    return (labels_array, counts_array)
        
    
def prepare_histogram_qualitative(attribute_data_array):
#    print('attribute data 695', attribute_data_array)
    attribute_data = []
    for attribute in attribute_data_array:
        labels = []
        values = []
        for qualitative_label in attribute['non_percentage']:
#            print('699 attribute', qualitative_label, sum(attribute['non_percentage'][qualitative_label]))
            labels.append(qualitative_label)
            values.append(sum(attribute['non_percentage'][qualitative_label]))
        attribute_data.append({'labels': labels, 'values': values})
#    print('attribute data 706', attribute_data)
            
    return attribute_data
    

def prepare_data(array):
    stats = []
    for row in array:
        stats.append(pd.DataFrame(row.tolist()).values.flatten())
    return stats
        
def create_labels(frequency, start_time, end_time):
    if frequency == 'daily':
        start_time = pd.Timestamp(start_time[0:-1])
        end_time = pd.Timestamp(end_time[0:-1])
        num_of_days = (end_time.to_period('D') - start_time.to_period('D')).n + 1
        labels = []
        for day in range(num_of_days):
            labels.append(str(start_time.to_period('D') + day))
        return labels
        
    elif frequency == 'hourly':
        start_time = pd.Timestamp(start_time[0:-1])
        end_time = pd.Timestamp(end_time[0:-1])
        num_of_hours = (end_time.to_period('H') - start_time.to_period('H')).n + 1
        labels = []
        for hour in range(num_of_hours):
            labels.append(str(start_time.to_period('H') + hour))
        return labels
    
    elif frequency == 'monthly':
        start_time = pd.Timestamp(start_time[0:-1])
        end_time = pd.Timestamp(end_time[0:-1])
        num_of_months = (end_time.to_period('M') - start_time.to_period('M')).n + 1
        labels = []
        for month in range(num_of_months):
            labels.append(str(start_time.to_period('M') + month))
        return labels
    
    elif frequency == 'annual':
        start_time = pd.Timestamp(start_time[0:-1])
        end_time = pd.Timestamp(end_time[0:-1])
        num_of_years = (end_time.to_period('Y') - start_time.to_period('Y')).n + 1
        labels = []
        for year in range(num_of_years):
            labels.append(str(start_time.to_period('Y') + year))
        return labels
#start process
if __name__ == '__main__':
    main()
