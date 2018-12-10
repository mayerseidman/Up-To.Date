
import './App.css';
import React, { Component } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
var _ = require('underscore');
var moment = require('moment');

class App extends Component {
    constructor(){
        super();
        const params = this.getHashParams();
        const token = params.access_token;
        if (token) {
            spotifyApi.setAccessToken(token);
        }
        this.state = {
            loggedIn: token ? true : false,
            playlists: "",
            phreshTracks: ""
        }
    }

    addTracksToPlaylist(tracks) {
        spotifyApi.addTracksToPlaylist("1u2cBdyM9woTxRsKy1lGgk", tracks)
        .then(function(data) {
            console.log('Added tracks to playlist!', data);
        }.bind(this), function(err) {
            console.log('Something went wrong!', err);
        }.bind(this));
    }

    createNewPlaylist() {
        spotifyApi.createPlaylist({
            name: 'NEWW PLAYLIST',
            'public' : false
        })
        .then(function(data) {
            console.log('Created playlist!', data);
        }, function(err) {
            console.log('Something went wrong!', err);
        });
    }


    findTracks() {
        Date.prototype.subtractDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() - days);
            return date;
        }

        var currentDate = moment();
        var olderDate = moment().subtract(30, "days");

        var newSongsArray = []

        this.state.playlists.map(function(playlistID) {
            spotifyApi.getPlaylist(playlistID)
            .then(function(data) {
                var newTracks = _.filter(data.tracks.items, function (x) { return moment(x.added_at) >= olderDate });
                    // console.log(newTracks, playlist.name)
                newSongsArray.push(newTracks)
            }, function(err) {
                console.error(err);
            }.bind(this));    
        }.bind(this), 

        setTimeout(() => {
            var tracks = _.pluck(_.flatten(newSongsArray), "track")
            var trackURIS = _.pluck(tracks, "uri")
            // spotifyApi.getPlaylist("1u2cBdyM9woTxRsKy1lGgk")
            // .then(function(data) {
            //     var playlist = data;
            //     console.log(playlist)
            // }, function(err) {
            //     console.log('Something went wrong!', err);
            // });
            
            console.log("FRESH TRACKS", tracks.length)

            var loops = Math.ceil(tracks.length/99);

            this.setState({ tracksToAdd: trackURIS })
            for (var i = 0; i < loops; i++) {
                console.log("Adding Round " + i)

                var batchedTracks = _.first(this.state.tracksToAdd, 99);
                this.addTracksToPlaylist(batchedTracks)

                var remainingTracks = _.difference(this.state.tracksToAdd, batchedTracks);
                console.log(remainingTracks.length)
                this.setState({ tracksToAdd: remainingTracks })
            }
        }, 1000))
    }

    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
        e = r.exec(q)
        while (e) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
            e = r.exec(q);
        }
        return hashParams;
    }

    getPlaylists() {
        spotifyApi.getUserPlaylists( { limit: 50 })  // note that we don't pass a user id
        .then(function(data) {
            // this.setState({ playlists: data.items });
            var playlists = data.items
            console.log(playlists)
            var playlists = playlists.map(function(playlist) {
                return playlist.id;
            })

            console.log(playlists)
            this.setState({ playlists: playlists });
        }.bind(this))
    }

  render() {
    var createPlaylistButton = (
        <button onClick={() => this.createNewPlaylist()}>Create that new playlist, WHITE BOY</button>     
    )
    return (
        <div className="App">
            { createPlaylistButton }
            <a href='http://localhost:8888' > Login to Spotify </a>
            <button onClick={() => this.getPlaylists() }>GET Playlists</button> <br/><br/>
            <button onClick={() => this.findTracks() }>FIND PHRESH TRACKS</button>
        </div>
    );
  }
}

export default App;