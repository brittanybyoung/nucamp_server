const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router()

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    //retrieve a favorite document for logged in user
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.array.forEach(campsite => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id)
                        }
                    });
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json')
                            res.json(favorite)
                        })
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body.map(c => c._id) })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json')
                            res.json(favorite)
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorite')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain')
                    res.end('You do not have any favorites to delete.')
                }
            })
            .catch(err => next(err));
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res) => {
        res.statusCode = 403;
        res.end('GET request is not supported.')
    })
    //req.params.campsiteId
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (favorite.campsites.includes(req.params.campsiteId)) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        return res.end('That campsite is already in your list of favorites!');
                    } else {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save().then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    }
                } else {
                    Favorite.create({
                        user: req.user._id,
                        campsites: [req.params.campsiteId]
                    })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite)
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT request is not supported.')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    const index = favorite.campsites.indexOf(req.params.campsiteId);
                    if (index >= 0) {
                        favorite.campsites.splice(index, 1);
                        favorite.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain')
                        res.end('That campsite is not in your list of favorites')
                    }
                } else {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end("You do not have any favorites to delete.")
                }
            })
            .catch(err => next(err))
    })


module.exports = favoriteRouter
