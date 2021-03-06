const { OAuth2Client } = require( 'google-auth-library' )

const { BlogPost } = require( '../models' )
const { GOOGLE_CLIENT_ID } = require( '../config' )

const client = new OAuth2Client( GOOGLE_CLIENT_ID )
async function decriptToken( token ) {

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID, 
  })
  return ticket.getPayload()

}

async function setup( bq, userId ) {

  try {

    const [ dataset, ] = await bq.dataset( 'users' ).get( { autoCreate : true } )
    const table = dataset.table( userId )

    const [ tableExists, ] = await table.exists()
    if ( !tableExists ) {
      await dataset.createTable( userId, { schema : BlogPost } )
    }

  } catch ( e ) {

    console.error( 'Error setting up user table: ', JSON.stringify( e ) )

  }  

}

async function insert( bq, userId, id, title, body, image, date ) {

  try {

    const [ dataset, ] = await bq.dataset( 'users' ).get( { autoCreate : true } )
    const table = dataset.table( userId )

    const [ tableExists, ] = await table.exists()
    if ( !tableExists ) {
      await dataset.createTable( userId, { schema : BlogPost } )
    }

    // should be good to insert
    await table.insert( { id, title, body, image, date } )

  } catch ( e ) {

    console.error( 'Error inserting data: ', JSON.stringify( e ) )

  }

}

// https://cloud.google.com/nodejs/docs/reference/bigquery/1.3.x/Table#getRows
async function get( bq, userId ) {

  try {

    const [ rows, ] = await bq.dataset( 'users' ).table( userId ).getRows()
    return rows 

  } catch ( e ) {

    console.error( 'Error getting data: ', e )

  }

}

module.exports = {
  decriptToken,
  insert,
  get,
  setup,
}
