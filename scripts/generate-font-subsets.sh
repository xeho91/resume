#!/bin/bash

set -eu

declare serif_name="Fraunces"
declare sans_serif_name="WorkSans"

declare root_dir="./"
declare build_dir="$root_dir/build/development"
declare fonts_dir="$root_dir/source/fonts"

declare unicodes
unicodes=$(command pnpx glyphhanger "$build_dir/index.html")

# Serif
command pipenv run pyftsubset "$fonts_dir/serif/$serif_name.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose
command pipenv run pyftsubset "$fonts_dir/serif/$serif_name-italic.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose

# Sans-serif
command pipenv run pyftsubset "$fonts_dir/sans-serif/$sans_serif_name.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose
command pipenv run pyftsubset "$fonts_dir/sans-serif/$sans_serif_name-italic.ttf" \
	--flavor=woff2 \
	--unicodes="$unicodes" \
	--verbose
