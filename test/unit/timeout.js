QUnit.test( 'timeout', function( assert ) {
  let done = assert.async( 4 );
  let elem = document.querySelector('#timeout-hanging');
  let imgLoader = new imagesLoaded( elem, { timeout: 300 } );

  imgLoader.on( 'progress', function( loader, image ) {
    assert.notOk( image.isLoaded, 'hanging image reported as broken' );
    done();
  } );
  imgLoader.on( 'done', function() {
    assert.ok( false, 'done should not trigger' );
  } );
  imgLoader.on( 'fail', function() {
    assert.ok( true, 'fail triggered after timeout' );
    done();
  } );
  imgLoader.on( 'always', function( instance ) {
    assert.ok( instance.isComplete, 'always triggered, loader complete' );
    assert.strictEqual( instance.progressedCount, 1, 'progressed once' );
    done();
    done();
  } );

} );

QUnit.test( 'retry success', function( assert ) {
  let done = assert.async( 4 );
  let elem = document.querySelector('#timeout-retry-success');
  let imgLoader = new imagesLoaded( elem, { retry: 2 } );

  imgLoader.on( 'retry', function( loader, image ) {
    assert.ok( true, 'retry triggered' );
    // swap in a valid image for the next attempt
    image.img.src = 'img/blue-shell.jpg';
    done();
  } );
  imgLoader.on( 'progress', function( loader, image ) {
    assert.ok( image.isLoaded, 'image loaded after retry' );
    done();
  } );
  imgLoader.on( 'done', function() {
    assert.ok( true, 'done triggered after successful retry' );
    done();
  } );
  imgLoader.on( 'always', function( instance ) {
    assert.strictEqual( instance.progressedCount, 1, 'progress counted once' );
    done();
  } );

} );

QUnit.test( 'retry exhausted', function( assert ) {
  let done = assert.async( 5 );
  let elem = document.querySelector('#timeout-retry-fail');
  let imgLoader = new imagesLoaded( elem, { retry: 2 } );

  let retryCount = 0;
  imgLoader.on( 'retry', function() {
    retryCount++;
    assert.ok( true, `retry #${retryCount} triggered` );
    done();
  } );
  imgLoader.on( 'progress', function( loader, image ) {
    assert.notOk( image.isLoaded, 'image still broken' );
    assert.strictEqual( retryCount, 2, 'all retries attempted before progress' );
    done();
  } );
  imgLoader.on( 'fail', function() {
    assert.ok( true, 'fail triggered after retries exhausted' );
    done();
  } );
  imgLoader.on( 'always', function( instance ) {
    assert.strictEqual( instance.progressedCount, 1, 'progress counted once' );
    done();
  } );

} );

QUnit.test( 'jquery retry progress', function( assert ) {
  let $ = window.jQuery;
  let done = assert.async( 3 );
  let progressCount = 0;

  $('#timeout-progress').imagesLoaded({ retry: 3, timeout: 500 })
    .progress( function() {
      progressCount++;
    } )
    .fail( function( instance ) {
      assert.ok( instance instanceof imagesLoaded, 'fail triggered with instance' );
      done();
    } )
    .always( function( instance ) {
      assert.strictEqual( progressCount, 2, 'progress triggered once per image' );
      assert.strictEqual( instance.progressedCount, 2, 'progressedCount matches images' );
      done();
      done();
    } );

} );
