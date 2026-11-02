-- Last fix with max wind >= 35 kt (or the storm's last fix if it never reached 35 kt),
-- from HURDAT2 best track. Null until the season's best track is published.
alter table catfisha_typhoons.hurricanes add column end_date date;
