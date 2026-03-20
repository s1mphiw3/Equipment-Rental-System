import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, equipmentAPI } from '../services/api';

// Import category images
const powerToolsImg = new URL('../pictures/Power Tools.jpg', import.meta.url).href;
const constructionImg = new URL('../pictures/Construction.jpg', import.meta.url).href;
const heavyEquipmentImg = new URL('../pictures/Heavy Equipment.jpg', import.meta.url).href;
const lawnGardenImg = new URL('../pictures/Lawn & Garden.jpg', import.meta.url).href;
const partyEventsImg = new URL('../pictures/Party & Events.jpg', import.meta.url).href;
const handToolsImg = new URL('../pictures/Hand Tools.jpg', import.meta.url).href;



const Home = () => {
  const { isAuthenticated } = useAuth();
  const [popularCategories, setPopularCategories] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: '🔧',
      title: 'Wide Equipment Selection',
      description: 'Choose from hundreds of tools and equipment for construction, events, and personal projects.'
    },
    {
      icon: '💰',
      title: 'Competitive Pricing',
      description: 'Get the best rates with flexible rental periods - hourly, daily, weekly, or monthly.'
    },
    {
      icon: '🚚',
      title: 'Easy Pickup & Return',
      description: 'Convenient locations and flexible scheduling for equipment pickup and return.'
    },
    {
      icon: '🛡️',
      title: 'Fully Insured',
      description: 'All equipment is maintained and insured for your peace of mind.'
    }
  ];

  const categoryImages = {
    'Power Tools': powerToolsImg,
    'Construction Tools': constructionImg,
    'Gardening Equipment': lawnGardenImg,
    'Heavy Equipment': heavyEquipmentImg,
    'Lawn & Garden': lawnGardenImg,
    'Party & Events': partyEventsImg,
    'Hand Tools': handToolsImg,
    // Fallback mappings for common variations
    'Construction': constructionImg,
    'Gardening': lawnGardenImg,
    'Event Equipment': partyEventsImg,
    'Tools': powerToolsImg
  };

  // Carousel navigation functions
  const nextSlide = () => {
    if (carouselSlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }
  };

  const prevSlide = () => {
    if (carouselSlides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and top categories concurrently
        const [categoriesResponse, topCategoriesResponse] = await Promise.all([
          equipmentAPI.getCategories(),
          analyticsAPI.getTopCategories()
        ]);

        const categoriesMap = {};
        categoriesResponse.data.forEach(cat => {
          categoriesMap[cat.name] = cat.id;
        });

        // Generate carousel slides from all categories
        const slides = categoriesResponse.data.map((category, index) => ({
          id: category.id,  // Use category.id as the unique key instead of index+1
          title: category.name,
          description: category.description || getCategoryDescription(category.name),
          image: categoryImages[category.name] || constructionImg,
          buttonText: `Browse ${category.name}`,
          categoryId: category.id
        }));
        console.log('Carousel slides with categoryIds:', slides.map(s => ({ title: s.title, categoryId: s.categoryId })));
        setCarouselSlides(slides);
        setCurrentSlide(0); // Reset to first slide when slides are loaded

        const categories = topCategoriesResponse.data.map((category) => ({
          name: category.category_name,
          id: categoriesMap[category.category_name],
          count: `${category.rental_count} rentals`,
          image: categoryImages[category.category_name] || constructionImg // Default fallback
        }));
        setPopularCategories(categories);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback carousel slides
        setCarouselSlides([
          {
            id: 1,
            title: 'Power Tools',
            description: 'Professional-grade power tools for all your construction needs',
            image: powerToolsImg,
            buttonText: 'Browse Power Tools',
            categoryId: 1
          },
          {
            id: 3,
            title: 'Construction Tools',
            description: 'Heavy-duty construction machinery and equipment rentals',
            image: constructionImg,
            buttonText: 'View Construction Tools',
            categoryId: 3
          },
          {
            id: 4,
            title: 'Lawn & Garden',
            description: 'Garden tools and equipment for landscaping and maintenance',
            image: lawnGardenImg,
            buttonText: 'Explore Gardening Equipment',
            categoryId: 4
          }
        ]);
        // Fallback to default categories if API fails
        setPopularCategories([
          { name: 'Power Tools', id: 2, count: '45+ items', image: powerToolsImg },
          { name: 'Construction Tools', id: 1, count: '30+ items', image: constructionImg },
          { name: 'Gardening Equipment', id: 3, count: '25+ items', image: lawnGardenImg }
        ]);
      }
    };

    fetchData();
  }, []);

  // Helper function to get category descriptions
  const getCategoryDescription = (categoryName) => {
    const descriptions = {
      'Power Tools': 'Professional-grade power tools for all your construction needs',
      'Construction Tools': 'Heavy-duty construction machinery and equipment rentals',
      'Gardening Equipment': 'Garden tools and equipment for landscaping and maintenance',
      'Heavy Equipment': 'Large machinery for major projects and industrial work',
      'Lawn & Garden': 'Garden tools and equipment for landscaping and maintenance',
      'Party & Events': 'Event equipment and supplies for celebrations and gatherings',
      'Hand Tools': 'Essential hand tools for precision work and repairs'
    };
    return descriptions[categoryName] || `${categoryName} for all your rental needs`;
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Carousel Container */}
          <div className="relative">
            {/* Slides */}
            <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg">
              {carouselSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'}`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between h-full">
                    {/* Text Content */}
                    <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                      <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {slide.title}
                        <span className="block text-primary-200">Made Simple</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link
                          to={`/equipment?category=${slide.categoryId}`}
                          className="group bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
                        >
                          {slide.buttonText}
                          <span className="ml-1 text-xs opacity-0 group-hover:opacity-100">{slide.categoryId}</span>
                        </Link>
                        {!isAuthenticated && (
                          <Link
                            to="/register"
                            className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
                          >
                            Get Started
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Image Content */}
                    <div className="md:w-1/2 flex justify-center">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-80 h-80 md:w-96 md:h-96 object-cover rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition duration-200 backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition duration-200 backdrop-blur-sm"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition duration-200 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EquipmentRental?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make equipment rental simple, affordable, and reliable for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">
              Explore our wide range of equipment categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((category, index) => (
              <Link
                key={index}
                to={`/equipment?category=${category.id}`}
                className="card p-6 text-center hover:shadow-lg transition-shadow duration-300 group"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-30 h-30 rounded-lg object-cover mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.count}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/equipment"
              className="btn-primary text-lg px-8 py-3"
            >
              View All Equipment
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers who trust us for their equipment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/equipment"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
              >
                Rent Equipment Now
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
                >
                  Create Account
                </Link>
                <Link
                  to="/equipment"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
                >
                  Browse Equipment
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;