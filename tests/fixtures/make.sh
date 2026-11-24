#!/bin/bash
# Small fixtures for the converter tests (about 2 s of video and sound, tiny images). Run once: bash tests/fixtures/make.sh
set -e
cd "$(dirname "$0")"
F="ffmpeg -hide_banner -loglevel error -y"
V="-f lavfi -i testsrc2=s=320x240:r=24:d=2"
A="-f lavfi -i sine=f=440:d=2:sample_rate=48000"
$F $V $A -c:v libvpx-vp9 -b:v 200k -c:a libopus -b:a 48k -shortest clip.webm
$F $V $A -c:v libvpx-vp9 -b:v 200k -c:a libopus -b:a 48k -shortest clip.mkv
$F $V $A -c:v libx264 -pix_fmt yuv420p -b:v 200k -c:a aac -b:a 64k -shortest -movflags +faststart clip.mp4
$F $V $A -c:v libx264 -pix_fmt yuv420p -b:v 200k -c:a aac -b:a 64k -shortest -f mov clip.mov
$F $A tone.wav
$F $A -c:a flac tone.flac
$F $A -c:a libopus tone.ogg
$F $A -c:a aac tone.m4a
$F $A -c:a libmp3lame -b:a 96k tone.mp3
$F $A -c:a aac -f adts tone.aac
$F -f lavfi -i testsrc2=s=160x120:r=10:d=1.5 -vf "split[a][b];[a]palettegen[p];[b][p]paletteuse" anim.gif
$F -f lavfi -i testsrc2=s=200x150:d=1 -frames:v 1 img.png
$F -i img.png -q:v 3 img.jpg
node ../../scripts/fixture-webp.mjs img.png img.webp
sips -s format heic img.png --out img.heic >/dev/null
sips -s format avif img.png --out img.avif >/dev/null
printf '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 64 48"><rect width="64" height="48" rx="8" fill="#0e7490"/><circle cx="32" cy="24" r="12" fill="#fff"/></svg>\n' > img.svg
