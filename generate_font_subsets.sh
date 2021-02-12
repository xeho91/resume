#!/bin/bash

set -eu

declare serif_font="Fraunces"
declare sans_serif_font="WorkSans"

declare serif_path="./source/fonts/serif/"
declare sans_serif_path="./source/fonts/sans-serif/"

declare unicodes

unicodes="$(glyphhanger ./build/development/index.html)"

# Serif
pyftsubset "./$serif_path/$serif_font.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose
pyftsubset "./$serif_path/$serif_font-italic.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose

# Sans-serif
pyftsubset "./$sans_serif_path/$sans_serif_font.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose
pyftsubset "./$sans_serif_path/$sans_serif_font-italic.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose
