#!/usr/bin/env bash
# Re-encode an mp4 for web delivery: caps resolution, re-encodes with
# libx264 at a web-friendly CRF, and moves the moov atom to the front for
# fast start. Run this on any large video before committing it.
#
# Usage: ./compress-video.sh <input.mp4> [output.mp4]
#   MAX_WIDTH    defaults to 1280 (video is scaled down if wider than this)
#   CRF          defaults to 26 (lower = higher quality, larger file)
#   STRIP_AUDIO  set to 1 to drop the audio track (e.g. muted hero loops)
set -euo pipefail

input="$1"
output="${2:-$input}"
max_width="${MAX_WIDTH:-1280}"
crf="${CRF:-26}"
tmp="${output}.compressing.mp4"

audio_args=(-c:a aac -b:a 128k)
if [ "${STRIP_AUDIO:-0}" = "1" ]; then
  audio_args=(-an)
fi

ffmpeg -y -i "$input" \
  -vf "scale='min(${max_width},iw)':-2" \
  -c:v libx264 -crf "$crf" -preset slow \
  "${audio_args[@]}" \
  -movflags +faststart \
  "$tmp"

before=$(du -h "$input" | cut -f1)
mv "$tmp" "$output"
after=$(du -h "$output" | cut -f1)
echo "Compressed $input: $before -> $after"
