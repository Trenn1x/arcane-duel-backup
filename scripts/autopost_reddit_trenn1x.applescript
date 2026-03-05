-- Auto-post 3 launch posts to the logged-in Reddit profile using Safari.
-- Requires Safari setting: Develop > Allow JavaScript from Apple Events.

on js_escape(t)
  set s to my replace_text("\\", "\\\\", t)
  set s to my replace_text("\"", "\\\"", s)
  set s to my replace_text(return, "\\n", s)
  set s to my replace_text(linefeed, "\\n", s)
  return s
end js_escape

on replace_text(find, repl, txt)
  set oldTIDs to AppleScript's text item delimiters
  set AppleScript's text item delimiters to find
  set itemsList to every text item of txt
  set AppleScript's text item delimiters to repl
  set outTxt to itemsList as text
  set AppleScript's text item delimiters to oldTIDs
  return outTxt
end replace_text

on post_to_reddit(postTitle, postBody)
  tell application "Safari"
    activate
    if (count of documents) = 0 then make new document
    set URL of front document to "https://old.reddit.com/user/That_Flamingo_3280/submit?selftext=true"
    delay 5

    set safeTitle to my js_escape(postTitle)
    set safeBody to my js_escape(postBody)

    set fillJS to "(function(){" & ¬
      "var t=document.querySelector('input[name=title]');" & ¬
      "var b=document.querySelector('textarea[name=text]');" & ¬
      "if(!t||!b){return 'missing_fields';}" & ¬
      "t.value=\"" & safeTitle & "\";" & ¬
      "b.value=\"" & safeBody & "\";" & ¬
      "t.dispatchEvent(new Event('input',{bubbles:true}));" & ¬
      "b.dispatchEvent(new Event('input',{bubbles:true}));" & ¬
      "var s=document.querySelector('button[type=submit],input[type=submit][name=submit]');" & ¬
      "if(!s){return 'missing_submit';}" & ¬
      "s.click();" & ¬
      "return 'ok';" & ¬
      "})();"

    set result to do JavaScript fillJS in front document
    delay 4
    return result
  end tell
end post_to_reddit

set posts to {¬
  {"trenn1x launch: Beaverforge (free browser beaver strategy card game + room-code multiplayer)", "Built this as trenn1x and just shipped online versus.\n\nPlay free: https://c6bc-2600-1004-a031-3423-312b-3350-df45-11dc.ngrok-free.app\nRepo: https://github.com/Trenn1x/arcane-duel-backup\nRelease notes: https://github.com/Trenn1x/arcane-duel-backup/releases/tag/v0.3-multiplayer-beta\n\nIf you run a match, drop your room code + what felt overpowered."}, ¬
  {"trenn1x room-code duels open now (Beaverforge multiplayer beta)", "Live now and looking for fast test matches.\n\nJoin: https://c6bc-2600-1004-a031-3423-312b-3350-df45-11dc.ngrok-free.app\nRoom-code thread: https://github.com/Trenn1x/arcane-duel-backup/issues/2\n\nFormat:\n- Room code\n- Best of\n- Winner\n- Balance note"}, ¬
  {"trenn1x devlog: from campaign to live 1v1 multiplayer in Beaverforge", "I added:\n- room code create/join/start\n- synced turn actions (play/attack/end turn)\n- mobile layout + installable PWA support\n\nRelease: https://github.com/Trenn1x/arcane-duel-backup/releases/tag/v0.3-multiplayer-beta\nPlay now: https://c6bc-2600-1004-a031-3423-312b-3350-df45-11dc.ngrok-free.app"}¬
}

set outcomes to {}
repeat with p in posts
  set theTitle to item 1 of p
  set theBody to item 2 of p
  try
    set result to my post_to_reddit(theTitle, theBody)
    set end of outcomes to (theTitle & " => " & result)
  on error errMsg
    set end of outcomes to (theTitle & " => ERROR: " & errMsg)
  end try
end repeat

return outcomes
