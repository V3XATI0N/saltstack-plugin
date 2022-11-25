<?php

apiDie([
    "buffer_text" => file_get_contents(__DIR__ . '/buffer_text.html'),
    "quick_commands" => getMinionShellQuickCommands()
], 200);