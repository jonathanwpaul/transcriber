#!/bin/bash
rm index.js && touch index.js

for file in "$(pwd)"/*.jsx; do
 	[ -e "$file" ] || continue
	fWithExt=$(basename "$file")
	f="${fWithExt%.*}"
	echo "export { default as $f } from './$f'" >> index.js
done

cat index.js
