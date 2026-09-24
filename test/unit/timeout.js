QUnit.test( 'timeout counts unsettled image as failed', function( assert ) {
  let done = assert.async();
  let img = document.createElement('img');
  // unroutable address, request never settles
  img.src = 'http://10.255.255.1/never-settles.jpg';
  let elem = document.createElement('div');
  elem.appendChild( img );

  let events = [];
  let imgLoader = imagesLoaded( elem, { timeout: 100 } );
  imgLoader.on( 'done', function() {
    assert.ok( false, 'done should not trigger' );
  } );
  imgLoader.on( 'fail', function() {
    events.push('fail');
  } );
  imgLoader.on( 'always', function() {
    events.push('always');
    assert.deepEqual( events, [ 'fail', 'always' ], 'fail then always' );
    assert.ok( !imgLoader.images[0].isLoaded, 'image is not loaded' );
    assert.ok( imgLoader.isComplete, 'loader completed' );
    done();
  } );
} );

QUnit.test( 'retry succeeds after initial failure', function( assert ) {
  let done = assert.async();
  let img = document.createElement('img');
  img.src = 'img/not-there.jpg';
  let elem = document.createElement('div');
  elem.appendChild( img );

  let retryCount = 0;
  let progressCount = 0;
  let imgLoader = imagesLoaded( elem, { retry: 2, retryDelay: 100 } );
  imgLoader.on( 'retry', function( loader, image, count ) {
    retryCount++;
    assert.equal( count, 1, 'first retry round' );
    // swap in a valid image for the retry
    image.img.src = 'img/blue-shell.jpg';
  } );
  imgLoader.on( 'progress', function() {
    progressCount++;
  } );
  imgLoader.on( 'fail', function() {
    assert.ok( false, 'fail should not trigger' );
  } );
  imgLoader.on( 'done', function() {
    assert.equal( retryCount, 1, 'retried once' );
    assert.equal( progressCount, 1, 'progress triggered once' );
    assert.ok( imgLoader.images[0].isLoaded, 'image is loaded' );
    done();
  } );
} );

QUnit.test( 'retry exhausted ends in fail', function( assert ) {
  let done = assert.async();
  let img = document.createElement('img');
  img.src = 'img/not-there.jpg';
  let elem = document.createElement('div');
  elem.appendChild( img );

  let retryCount = 0;
  let progressCount = 0;
  let events = [];
  let imgLoader = imagesLoaded( elem, { retry: 2, retryDelay: 30 } );
  imgLoader.on( 'retry', function() {
    retryCount++;
  } );
  imgLoader.on( 'progress', function() {
    progressCount++;
  } );
  imgLoader.on( 'fail', function() {
    events.push('fail');
  } );
  imgLoader.on( 'always', function() {
    events.push('always');
    assert.equal( retryCount, 2, 'retried twice' );
    assert.equal( progressCount, 1, 'progress triggered once' );
    assert.equal( imgLoader.images[0].retries, 2, 'image retries counted' );
    assert.ok( !imgLoader.images[0].isLoaded, 'image is not loaded' );
    assert.deepEqual( events, [ 'fail', 'always' ], 'fail then always' );
    done();
  } );
} );

QUnit.test( 'progress is not double counted during retries', function( assert ) {
  let done = assert.async();
  let okayImg = document.createElement('img');
  okayImg.src = 'img/blue-shell.jpg';
  let brokenImg = document.createElement('img');
  brokenImg.src = 'img/not-there.jpg';
  let elem = document.createElement('div');
  elem.appendChild( okayImg );
  elem.appendChild( brokenImg );

  let progressCount = 0;
  let imgLoader = imagesLoaded( elem, { retry: 3, retryDelay: 20 } );
  imgLoader.on( 'progress', function() {
    progressCount++;
  } );
  imgLoader.on( 'always', function( loader ) {
    assert.equal( progressCount, 2, 'progress triggered once per image' );
    assert.equal( loader.progressedCount, 2, 'progressedCount matches image count' );
    assert.equal( loader.images.length, 2, 'two images' );
    assert.ok( loader.hasAnyBroken, 'has broken image' );
    done();
  } );
} );
