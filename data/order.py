import csv
import pandas as pd

facility_data = pd.read_csv("dailydetentioncases.csv")
facilities = facility_data['Name']

cases_count = facility_data[-1] #get the most recent column

print(head(facilities))