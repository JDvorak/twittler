(function ($) {
  var $body           = $(document.body),
      $window         = $(window),
      $timeline       = $body.find('.timeline'),
      username        = 'blakeembrey',
      highestPosition = 0,
      scrollPosition  = 0,
      changeTimeline, sendUserTweet, newTweetsCount;

  sendUserTweet = function (text) {
    var tweet        = {};
    tweet.user       = username;
    tweet.message    = text;
    tweet.created_at = new Date();
    addTweet(tweet);
  };

  newTweetsCount = function () {
    var tweets = 0,
        height = $timeline.offset().top;
    $timeline.children().each(function () {
      height += $(this).height();
      if (height < highestPosition) {
        tweets++;
      } else {
        return false;
      }
    });

    $('.return .badge').text(tweets).toggleClass('hide', !tweets);

    return tweets;
  };

  (function addTweets () {
    var length    = streams.home.length,
        newHeight = 0,
        tweets    = [], template, $newTweets;

    template = function (tweet) {
      var pattern = '',
          escape  = function (str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          };

        pattern += '<li class="tweet user-' + escape(tweet.user) + ' clearfix">';
        // Don't show profile images for the local user
        pattern += '<img src="https://api.twitter.com/1/users/profile_image/' + (tweet.user === username ? 'blakeembrey' : tweet.user) + '" class="pull-right img-polaroid">';
        pattern += '<blockquote class="pull-right">';
        pattern += '<p class="tweet-data">' + escape(tweet.message) + '</p>';
        pattern += '<small>';
        // If the tweeting user matches the current user, don't allow retweets
        if (tweet.user !== username) {
          pattern += '<a href="#retweet" class="icon-retweet tweet-retweet"></a> ';
        }
        pattern += '<a href="#' + encodeURIComponent(escape(tweet.user)) + '">@' + escape(tweet.user) + '</a> ';
        pattern += '<span class="tweet-time" title="' + tweet.created_at + '" data-time="' + (+tweet.created_at) + '">';
        pattern += tweet.created_at + '</span>';
        pattern += '</small>';
        pattern += '</blockquote>';
        pattern += '</li>';
        return pattern;
    };

    // Move from the front of the deck to the bottom of the other, passing it through the template
    while (length--) {
      tweets.unshift(template(streams.home.shift()));
    }

    $newTweets = $(tweets.join('\n')).prependTo($timeline).filter('.tweet').each(function () {
      newHeight += $(this).height();
    });

    // Stick the position of the viewport as tweets are added
    highestPosition += newHeight;
    $window.scrollTop(scrollPosition + newHeight);

    $timeline.find('.tweet-time').each(function () {
      var $this = $(this);
      $this.text(moment($this.data('time')).fromNow());
    });

    setTimeout(addTweets, 3000);
  })();

  changeTimeline = function () {
    var username = location.hash.substr(1),
        $style   = $('#tweet-style'),
        newStyle = '';

    $window.scrollTop(0);
    $style.empty();
    $('.title').text(username);

    if (!username) { return; }
    // Show and hide irrelevant tweets
    newStyle += '.tweet { display: none; } \n';
    newStyle += '.user-' + username + ' { display: block; } \n';
    newStyle += '.btn-home { display: inline-block; } \n';
    $style.append(newStyle);
  };

  $window
    .on('hashchange', changeTimeline)
    .on('scroll', function () {
      scrollPosition = $window.scrollTop();
      if (scrollPosition < highestPosition) {
        highestPosition = scrollPosition;
      }
      $('.return').toggleClass('hide', scrollPosition < 1); // Hide when at top of page

      newTweetsCount();
    });

  $body
    .on('click', '.tweet-retweet', function (e) {
      e.preventDefault();
      var $this = $(this);

      if ($this.is('.active')) { return; }

      $this.addClass('active');
      sendUserTweet('rt: ' + $this.closest('.tweet').find('.tweet-data').text());
    })
    .on('click', '.return', function (e) {
      e.preventDefault();
      $window.scrollTop(0);
    })
    .on('submit', '#send-tweet', function (e) {
      e.preventDefault();

      var $this     = $(this),
          $textarea = $this.find('textarea');

      sendUserTweet($textarea.val());
      $this.modal('hide');
      $textarea.val('');
    });

  changeTimeline();

})(window.jQuery);