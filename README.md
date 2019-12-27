# Geospatial Search Frontend

This repository contains a frontend search application which is used in a project at the Saxon State and University Library Dresden (SLUB). The used backend systems are TYPO3 with Kitodo.Presentation 3.0 and Solr 7.x.

## Requirements

* Solr 7.8
* [Kitodo.Presentation 3.0](https://github.com/kitodo/kitodo-presentation)

The Solr must be accessible from the frontend for select queries. You should use some proxy solution to secure your Solr.

## Solr Schema

The application requires the standard schema of Kitodo.Presentation 3.0 which is provided in its repo at https://github.com/kitodo/kitodo-presentation/tree/master/Configuration/ApacheSolr.

To make the geospatial search available in Solr, you need only two settings in the schema.xml. A fieldType "geojson" and a field "geom" which uses this fieldType. 
The search application requires `geom` as the name of the field for the geometries. It supports point, polyline and polygon.

```
<types>
  <fieldType name="geojson" class="solr.SpatialRecursivePrefixTreeFieldType" 
  spatialContextFactory="Geo3D" 
  geo="true" 
  planetModel="WGS84" 
  format="GeoJSON" />
...

<fields>
  <field name="geom" type="geojson" indexed="true" stored="true" multiValued="false" />
```

## GeoJSON

There is only support for GeoJSON. Solr knows WKT as input format, too. But this was no aspect in developement.

Our usecase is to use Kitodo.Presentation to index documents with GeoJSON data in MODS-metadata field`./mods:mods/#mods:subject/mods:cartographics/mods:coordinates`.

### Example GeoJSON

There is no documentation about the allowed format of the GeoJSON data inserting by Solr. At least we found none ;-)

Solr can work with the following example from geojson.io. 

Hint: The `properties` must exist, but no property is understood by Solr. The record will fail with error. So keep it empty.

```
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              12.63427734375,
              51.51216124955515
            ],
            [
              12.777099609375,
              51.10007257240614
            ],
            [
              14.0020751953125,
              50.90996067566236
            ],
            [
              14.3316650390625,
              51.36835106051133
            ],
            [
              12.63427734375,
              51.51216124955515
            ]
          ]
        ]
      }
    }
  ]
}
```

## Credits

This project was initially developed for the [Saxon digital geological archive (DiGAS) website](https://www.digas.sachsen.de). This website is maintainted by the [Saxon State and University Library Dresden (SLUB)(https://www.slub-dresden.de/)] in cooperation with the [Sächsisches Landesamt für Umwelt, Landwirtschaft und Geologie (LfULG)](https://www.lfulg.sachsen.de/).

This React JS webapp was developed by Jacob Mendt at [PikoBytes GmbH](https://pikobytes.de/) in Dresden in 2019.