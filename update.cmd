rem set FILE=allCountries.zip
set FILE=cities1000

curl http://download.geonames.org/export/dump/%FILE%.zip -o data/data.zip

rem Extract
7z e data/data.zip -y -odata %FILE%.txt

rem Delete archive
del /Q data\data.zip

pause
