#!/bin/bash

set -eu

declare unicodes="$(glyphhanger ./build/development/index.html)"
declare serif_font="Fraunces"
declare sans_serif_font="WorkSans"

pyftsubset "./source/fonts/serif/$serif_font.ttf" --flavor=woff2 --unicodes="$unicodes" --verbose
pyftsubset "./source/fonts/serif/$serif_font-italic.ttf" --flavor=woff2 --unicodes="$unicodes" --verbose

pyftsubset "./source/fonts/sans-serif/$sans_serif_font.ttf" --flavor=woff2 --unicodes="$unicodes" --verbose
pyftsubset "./source/fonts/sans-serif/$sans_serif_font-italic.ttf" --flavor=woff2 --unicodes="$unicodes" --verbose
