-- Drop depressions that HURDAT2 lists by number instead of a name (e.g. TWENTY-TWO 2005,
-- FIFTEEN 2007, ELEVEN 2024). They never took a name from the lists, so they would skew
-- the named-storm counts and show up as "active" storms.
delete from catfisha_typhoons.hurricanes
where name ~* '^((one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)[- ]?)+$';
