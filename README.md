# 3DU Image Processor

The objective of this library is to analyze a photograph taken by a mobile device of a particular layout of construction blocks (as used in 3DU Blocks Music, a project inside the [CTD - Cátedra Telefónica-Deusto]) and obtain its digital representation.

[CTD - Cátedra Telefónica-Deusto]: http://blog.catedratelefonica.deusto.es/

## 3DU Blocks Music

3DU Blocks Music is a multiplatform educational game that uses construction blocks and mobile devices (smartphones and tablets) to create new gaming experiences for kids. 3DU Blocks Music allows to set a layout of color construction blocks over a table, take a photograph of them and start playing in a musical game, where each color corresponds to a different musical instrument and its position to a certain note.

This library provides methods for:
* Converting from RGB to HSV model color.
* Determine the color (between the recognizables ones in the app) given its RGB components.
* Normalize an image according to the recognizable colors.
* Determine the predominant color of an area.
* Calculate the rotation of the layout and correct it to be the most horizontally possible.
* Rotate an array a given number of degrees.
* Calculate the margins of the construction-block layout.
* Resize the image to work with more confortable dimensions.

## Recognizable colors

Actually the library recognizes the following basic colors:
* Red
* Green
* Blue
* Yellow
* White
* Black

If a color doesn't match any of the colors above, it is classified as UNDEFINED_COLOR.

## Authors

* Oscar Peña del Rio
* Jon Ander Romero Martínez