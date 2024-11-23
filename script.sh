#!/bin/bash

# Ask for the user's name
echo "What is your name?"
read NAME

# Greet the user
echo "Hello, $NAME!"

# Ask how they are doing
echo "How are you doing today? (good/bad)"
read RESPONSE

# Conditional to respond to their input
if [[ "$RESPONSE" == "good" ]]; then
    echo "That's great to hear, $NAME!"
elif [[ "$RESPONSE" == "bad" ]]; then
    echo "Sorry to hear that, $NAME. Hope your day gets better!"
else
    echo "Hmm, I didn't understand that. Take care, $NAME!"
fi
